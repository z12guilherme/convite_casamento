import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Configuração ────────────────────────────────────────────────────────────
// Para alterar sem redeploy: npx supabase secrets set PIX_KEY=+5581989035561
const RAW_PIX_KEY    = Deno.env.get("PIX_KEY")         ?? "81989035561";
const MERCHANT_NAME  = Deno.env.get("MERCHANT_NAME")   ?? "EVELLYN E GUILHERME";
const MERCHANT_CITY  = Deno.env.get("MERCHANT_CITY")   ?? "BELO JARDIM";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Normalização da Chave PIX ────────────────────────────────────────────────
// O DICT do Banco Central exige que telefones estejam em formato E.164: +5581989035561
// Sem o +55 a consulta ao DICT falha com "indisponibilidade" no app do banco.
function normalizePixKey(key: string): string {
  const trimmed = key.trim();

  // Já está em E.164 → ok
  if (trimmed.startsWith("+")) return trimmed;

  // Remove tudo que não for dígito para análise
  const digits = trimmed.replace(/\D/g, "");

  // Telefone brasileiro com DDD (10 = fixo, 11 = celular)
  // DDDs válidos: 11–99. Se os 2 primeiros dígitos caírem nesse range, trata como tel.
  if (digits.length === 10 || digits.length === 11) {
    const ddd = parseInt(digits.substring(0, 2), 10);
    if (ddd >= 11 && ddd <= 99) {
      return `+55${digits}`;
    }
  }

  // CPF (11 dígitos com leading zeros possíveis), CNPJ (14), e-mail, chave aleatória (UUID)
  return trimmed;
}

// ─── Geração do PIX copia-e-cola (padrão EMV / BR Code — BCB) ────────────────
function emv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Remove acentos e caracteres não permitidos pelo padrão EMV
function sanitizeText(s: string, max: number): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove diacríticos
    .replace(/[^A-Za-z0-9 ]/g, " ")    // substitui especiais por espaço
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, max);
}

function generatePixEMV(
  pixKey: string,
  merchantName: string,
  merchantCity: string,
  amount: number,
  description: string,
  txId: string
): string {
  const name  = sanitizeText(merchantName, 25);
  const city  = sanitizeText(merchantCity, 15);
  const desc  = sanitizeText(description,  40);
  const tx    = txId.replace(/[^A-Za-z0-9]/g, "").substring(0, 25) || "***";

  // Campo 26 — Merchant Account Info para PIX
  const gui = emv("00", "BR.GOV.BCB.PIX");
  const key = emv("01", pixKey);                         // chave PIX (obrigatório)
  const inf = desc ? emv("02", desc) : "";               // descrição (opcional)
  const mae = emv("26", `${gui}${key}${inf}`);

  // Campo 62 — Additional Data Field (txid obrigatório pelo BCB)
  const adf = emv("62", emv("05", tx));

  // Corpo sem CRC
  const body = [
    emv("00", "01"),                                     // Payload Format Indicator
    mae,                                                  // Merchant Account Info
    emv("52", "0000"),                                   // MCC (0000 = genérico)
    emv("53", "986"),                                    // BRL
    amount > 0 ? emv("54", amount.toFixed(2)) : "",     // Valor (opcional)
    emv("58", "BR"),                                     // País
    emv("59", name),                                     // Nome do recebedor
    emv("60", city),                                     // Cidade
    adf,                                                  // Dados adicionais
    "6304",                                              // Placeholder CRC
  ].join("");

  return body + crc16ccitt(body);
}

// ─── Handler ─────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, amount, guestName, giftId } = await req.json();

    const transactionAmount = parseFloat(String(amount));
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      throw new Error("Valor inválido para o pagamento PIX.");
    }

    // Normaliza a chave PIX (adiciona +55 se for telefone sem prefixo)
    const pixKey = normalizePixKey(RAW_PIX_KEY);

    // ID de transação único (máx. 25 chars alfanuméricos)
    const txId = `G${Date.now()}`;

    // Gera o copia-e-cola
    const pixString = generatePixEMV(
      pixKey,
      MERCHANT_NAME,
      MERCHANT_CITY,
      transactionAmount,
      title || "Presente casamento",
      txId
    );

    console.log("PIX Key (normalizada):", pixKey);
    console.log("PIX EMV gerado:", pixString);

    // Gera QR Code PNG via qrserver.com (gratuito, sem autenticação)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${
      encodeURIComponent(pixString)
    }&size=280x280&margin=10&format=png&ecc=M`;

    const qrResponse = await fetch(qrUrl);
    if (!qrResponse.ok) throw new Error(`Falha ao gerar QR Code: ${qrResponse.status}`);

    // Converte PNG para base64
    const qrBuffer = await qrResponse.arrayBuffer();
    const bytes    = new Uint8Array(qrBuffer);
    let binary     = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const qrBase64 = btoa(binary);

    // Registra contribuição pendente no Supabase (não bloqueia em caso de erro)
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: giftData } = await supabase
        .from("gifts")
        .select("contributions")
        .eq("id", giftId)
        .single();

      await supabase
        .from("gifts")
        .update({
          contributions: [
            ...(giftData?.contributions ?? []),
            {
              name:   guestName || "Convidado",
              amount: transactionAmount,
              date:   new Date().toISOString(),
              tx_id:  txId,
              status: "pending_pix",
            },
          ],
        })
        .eq("id", giftId);
    } catch (dbErr) {
      console.warn("Aviso DB:", dbErr);
    }

    return new Response(
      JSON.stringify({ qr_code: pixString, qr_code_base64: qrBase64, payment_id: txId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("create-pix error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
