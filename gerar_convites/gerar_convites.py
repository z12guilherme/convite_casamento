from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from openpyxl import load_workbook
from PyPDF2 import PdfReader, PdfWriter
import io
import os

os.makedirs("convites", exist_ok=True)

# 🔹 Registrar a fonte Byriani
pdfmetrics.registerFont(TTFont("Byriani", "byrani.ttf"))

# Excel
wb = load_workbook("convidados.xlsx")
sheet = wb.active

# Obter dimensões reais do template para garantir centralização correta
reader_temp = PdfReader("Convite_Template.pdf")
largura, altura = float(reader_temp.pages[0].mediabox.width), float(reader_temp.pages[0].mediabox.height)

for linha in sheet.iter_rows(min_row=2, values_only=True):
    nome = linha[0]
    if not nome:
        continue

    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=(largura, altura))

    # 🔴 Nome com a fonte Byriani
    # ajuste automático para nomes longos
    if len(nome) <= 15:
        tamanho = 20 # 📏 Tamanho para nomes curtos (aumente ou diminua aqui)
    elif len(nome) <= 22:
        tamanho = 18 # 📏 Tamanho para nomes médios
    else:
        tamanho = 14 # 📏 Tamanho para nomes muito longos

    c.setFont("Byriani", tamanho)
    c.setFillColor(HexColor("#54a0a0")) # 🎨 Cor da fonte (Ex: #000000 = Preto, #D4AF37 = Dourado)
    posicao_y = 210 # Ajuste este valor para subir ou descer o nome
    c.drawCentredString(
        largura / 2, posicao_y,  nome  # ajuste fino vertical (mude até alinhar com o {NOME} 
       )

    c.save()
    packet.seek(0)

    # Carregar o template a cada iteração para evitar sobreposição de nomes
    template = PdfReader("Convite_Template.pdf")
    pagina_base = template.pages[0]

    overlay = PdfReader(packet)
    pagina_base.merge_page(overlay.pages[0])

    writer = PdfWriter()
    writer.add_page(pagina_base)

    with open(f"convites/convite_{nome.replace(' ', '_')}.pdf", "wb") as f:
        writer.write(f)
