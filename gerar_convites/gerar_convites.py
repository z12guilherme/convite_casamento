from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from openpyxl import load_workbook
from PyPDF2 import PdfReader, PdfWriter
import io
import os
import qrcode
from urllib.parse import quote

# =================================================================================
# ⚙️ CONFIGURAÇÕES
# =================================================================================
# ❗️❗️❗️ IMPORTANTE: Verifique se esta é a URL base correta do seu site!
URL_BASE_DO_SITE = "https://casamento-evellyn-e-guilherme.netlify.app"
# =================================================================================

os.makedirs("convites", exist_ok=True)

# 🔹 Registrar fontes
pdfmetrics.registerFont(TTFont("Byriani", "byrani.ttf"))
pdfmetrics.registerFont(TTFont('Vera', 'Vera.ttf')) # Fonte padrão para o texto do QR Code

# Carregar planilha do Excel
wb = load_workbook("convidados.xlsx")
sheet = wb.active

# Obter dimensões do template
reader_temp = PdfReader("Convite_Template.pdf")
largura, altura = float(reader_temp.pages[0].mediabox.width), float(reader_temp.pages[0].mediabox.height)

print("🚀 Iniciando a geração dos convites com QR Code personalizado...")

for linha in sheet.iter_rows(min_row=2, values_only=True):
    nome = linha[0]
    if not nome:
        continue

    print(f"  -> Gerando para: {nome}")

    # --- Gera um QR Code personalizado para cada convidado ---
    url_personalizada = f"{URL_BASE_DO_SITE}/invite.html?name={quote(nome)}"
    qr_img = qrcode.make(url_personalizada)
    
    qr_img_bytes = io.BytesIO()
    qr_img.save(qr_img_bytes, format='PNG')
    qr_img_bytes.seek(0)
    qr_code_para_pdf = ImageReader(qr_img_bytes)
    # ----------------------------------------------------

    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=(largura, altura))

    # 🔴 Nome com a fonte Byriani
    if len(nome) <= 15:
        tamanho = 20
    elif len(nome) <= 22:
        tamanho = 18
    else:
        tamanho = 14

    c.setFont("Byriani", tamanho)
    c.setFillColor(HexColor("#54a0a0"))
    posicao_y_nome = 210
    c.drawCentredString(largura / 2, posicao_y_nome, nome)

    # 🔳 Adiciona o QR Code e o texto
    qr_size = 80
    left_margin = 20  # Margem da esquerda para o alinhamento
    posicao_y_qr = 10
    
    c.setFont("Vera", 9)
    c.setFillColor(HexColor("#333333"))
    # Desenha o QR Code na posição esquerda
    c.drawImage(qr_code_para_pdf, left_margin, posicao_y_qr, width=qr_size, height=qr_size, mask='auto')
    
    c.save()
    packet.seek(0)

    # Mistura o conteúdo gerado com o template PDF
    template = PdfReader("Convite_Template.pdf")
    pagina_base = template.pages[0]

    overlay = PdfReader(packet)
    pagina_base.merge_page(overlay.pages[0])

    writer = PdfWriter()
    writer.add_page(pagina_base)

    # Salva o arquivo final
    nome_arquivo = "".join(c for c in nome if c.isalnum() or c in (' ',)).rstrip()
    with open(f"convites/convite_{nome_arquivo.replace(' ', '_')}.pdf", "wb") as f:
        writer.write(f)

print("\n✅ Convites gerados com sucesso na pasta 'convites'!")
