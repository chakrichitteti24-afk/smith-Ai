import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_resume_pdf(filename="DavidEliot_Resume.pdf"):
    # Create the document
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'Name',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=15
    )
    
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f766e"),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        spaceAfter=4
    )
    
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=2
    )

    story = []
    
    # Name
    story.append(Paragraph("David Eliot", title_style))
    
    # Contact
    contact_text = "<b>Phone:</b> +1 (970) 333-3833 | <b>Email:</b> david.eliot@mail.com | <b>LinkedIn:</b> www.linkedin.com/in/david.eliot"
    story.append(Paragraph(contact_text, body_style))
    story.append(Spacer(1, 10))
    
    # Summary Section
    story.append(Paragraph("Summary", section_style))
    summary_text = (
        "Bartender with 7 years' experience in a restaurant bar setting. Successful at "
        "consistently delivering the highest quality service. Quick worker who always "
        "goes the extra mile to sell more and keep customers happy. Trained Mixologist "
        "with a wide-ranging repertoire of cocktails, from the classics to original recipes."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))
    
    # Experience Section
    story.append(Paragraph("Experience", section_style))
    
    # Job 1
    story.append(Paragraph("Bartender | Momo Restaurant, New York | 09/2017 to 05/2019", meta_style))
    bullets_job1 = [
        "Promptly served all cocktails and alcoholic drinks to guests.",
        "Maintain stock levels to prevent shortages.",
        "Strictly abided by all state liquor regulations, particularly in regard to intoxicated persons and minors.",
        "Participate in bar contests to drive sales and promote the venue.",
        "Taking care of your appearance (cleanliness, neatness, elegance)."
    ]
    for b in bullets_job1:
        story.append(Paragraph(f"- {b}", bullet_style))
        
    story.append(Spacer(1, 6))
    
    # Job 2
    story.append(Paragraph("Bartender | Si Italian Restaurant, New York | 09/2015 to 05/2017", meta_style))
    bullets_job2 = [
        "Preparing cocktails, drinks and other drinks ordered by the restaurant guests.",
        "Efficient and courteous service of restaurant guests.",
        "Taking care of your appearance (cleanliness, neatness, elegance).",
        "Taking care of cleanliness and order in the workplace."
    ]
    for b in bullets_job2:
        story.append(Paragraph(f"- {b}", bullet_style))
        
    story.append(Spacer(1, 8))
    
    # Highlights Section
    story.append(Paragraph("Highlights & Skills", section_style))
    highlights = [
        "Mastery of classic cocktail recipes",
        "Bar management",
        "Friendly and professional demeanor",
        "Excels at up selling",
        "Clean and neat representation",
        "Cocktail Ingredients expert"
    ]
    highlights_text = ", ".join(highlights)
    story.append(Paragraph(highlights_text, body_style))
    story.append(Spacer(1, 8))
    
    # Education Section
    story.append(Paragraph("Education", section_style))
    story.append(Paragraph("<b>Bachelor of Science: Cook</b> (2014)<br/>Cookery School (High School), Dublin", body_style))
    
    # Build document
    doc.build(story)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    create_resume_pdf()
