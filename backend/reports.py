import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import os
from datetime import datetime

def get_custom_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='Header',
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.darkblue,
        alignment=1,
        spaceAfter=12
    ))
    styles.add(ParagraphStyle(
        name='SubHeader',
        fontName='Helvetica',
        fontSize=12,
        textColor=colors.grey,
        alignment=1,
        spaceAfter=8
    ))
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.black,
        spaceBefore=12,
        spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        name='CustomBodyText',
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.black,
        spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        name='Suggestion',
        fontName='Helvetica-Oblique',
        fontSize=10,
        textColor=colors.darkslategray,
        bulletFontName='Helvetica',
        bulletFontSize=10,
        leftIndent=10,
        spaceAfter=4
    ))
    return styles

def add_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica-Bold', 10)
    canvas.setFillColor(colors.darkblue)
    canvas.drawString(inch, doc.pagesize[1] - 0.5 * inch, "Finvix AI Performance Report")
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.grey)
    canvas.drawRightString(doc.pagesize[0] - inch, doc.pagesize[1] - 0.5 * inch, 
                           f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.grey)
    canvas.drawCentredString(doc.pagesize[0] / 2, 0.5 * inch, f"Page {doc.page}")
    canvas.restoreState()

def generate_pdf(filename, dashboard_data, actual_roi, predicted_roi, actual_conversions, predicted_conversions, suggestions, model_type='both', results=None):
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=inch, rightMargin=inch, topMargin=inch, bottomMargin=inch)
    styles = get_custom_styles()
    story = []

    # Cover Page
    story.append(Paragraph("Finvix AI Performance Report", styles['Header']))
    story.append(Spacer(1, 0.5 * inch))
    if os.path.exists('finvix_logo.jpg'):
        logo = Image('finvix_logo.jpg', width=150, height=75)
        logo.hAlign = 'CENTER'
        story.append(logo)
        story.append(Spacer(1, 0.25 * inch))
    story.append(Paragraph(f"Report ID: {os.path.basename(filename)}", styles['SubHeader']))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['SubHeader']))
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("Prepared by: Finvix AI Team", styles['CustomBodyText']))
    story.append(PageBreak())

    # Executive Summary
    story.append(Paragraph("Executive Summary", styles['SectionTitle']))
    if results is None:  # Single prediction
        if model_type == 'roi':
            summary_text = (
                f"This report analyzes ROI predictions for the given input. "
                f"Actual ROI: {actual_roi:.2f}, Predicted ROI: {predicted_roi:.2f}. "
                "See detailed analysis and suggestions below."
            )
        elif model_type == 'conversions':
            summary_text = (
                f"This report analyzes Conversions predictions for the given input. "
                f"Actual Conversions: {actual_conversions:.2f}, Predicted Conversions: {predicted_conversions:.2f}. "
                "See detailed analysis and suggestions below."
            )
        else:  # 'both'
            summary_text = (
                f"This report analyzes ROI and Conversions predictions for the given input. "
                f"Actual ROI: {actual_roi:.2f}, Predicted ROI: {predicted_roi:.2f}, "
                f"Actual Conversions: {actual_conversions:.2f}, Predicted Conversions: {predicted_conversions:.2f}. "
                "See detailed analysis and suggestions below."
            )
    else:  # File upload results
        summary_text = (
            f"This report analyzes {model_type.capitalize()} predictions for {len(results)} data row(s). "
            f"Average actual ROI: {actual_roi:.2f}, predicted ROI: {predicted_roi:.2f}, "
            f"average actual conversions: {actual_conversions:.2f}, predicted conversions: {predicted_conversions:.2f}. "
            "See detailed analysis and suggestions below."
        )
    story.append(Paragraph(summary_text, styles['CustomBodyText']))
    story.append(Spacer(1, 0.25 * inch))

    # Uploaded Data Table (if results provided)
    if results:
        story.append(Paragraph("Uploaded Data Details", styles['SectionTitle']))
        if model_type == 'roi':
            data_table = [['Row', 'Actual ROI', 'Predicted ROI']]
            for i, row in enumerate(results, start=1):
                data_table.append([
                    str(i),
                    f"{row.get('actual_roi', 0):.2f}",
                    f"{row.get('roi', 0):.2f}"
                ])
            colWidths = [0.8 * inch, 1.5 * inch, 1.5 * inch]
        elif model_type == 'conversions':
            data_table = [['Row', 'Actual Conversions', 'Predicted Conversions']]
            for i, row in enumerate(results, start=1):
                data_table.append([
                    str(i),
                    f"{row.get('actual_conversions', 0):.2f}",
                    f"{row.get('conversions', 0):.2f}"
                ])
            colWidths = [0.8 * inch, 1.5 * inch, 1.5 * inch]
        else:  # 'both'
            data_table = [['Row', 'Actual ROI', 'Predicted ROI', 'Actual Conversions', 'Predicted Conversions']]
            for i, row in enumerate(results, start=1):
                data_table.append([
                    str(i),
                    f"{row.get('actual_roi', 0):.2f}",
                    f"{row.get('roi', 0):.2f}",
                    f"{row.get('actual_conversions', 0):.2f}",
                    f"{row.get('conversions', 0):.2f}"
                ])
            colWidths = [0.8 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch]

        table = Table(data_table, colWidths=colWidths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        story.append(KeepTogether(table))
        story.append(Spacer(1, 0.25 * inch))

        # Visualizations for Uploaded Data
        if model_type in ['roi', 'both']:
            plt.figure(figsize=(6, 3))
            actual_rois = [row.get('actual_roi', 0) for row in results]
            predicted_rois = [row.get('roi', 0) for row in results]
            labels = [f"Row {i+1}" for i in range(len(results))]
            x = range(len(labels))
            plt.bar(x, actual_rois, width=0.4, label='Actual ROI', color='#1E90FF', align='center')
            plt.bar([i + 0.4 for i in x], predicted_rois, width=0.4, label='Predicted ROI', color='#32CD32', align='center')
            plt.xticks([i + 0.2 for i in x], labels, rotation=45, ha='right')
            plt.title('Actual vs Predicted ROI', fontsize=12, fontweight='bold')
            plt.ylabel('ROI')
            plt.legend()
            plt.tight_layout()
            plt.savefig('roi_upload_chart.png', bbox_inches='tight', dpi=100)
            plt.close()
            story.append(Image('roi_upload_chart.png', width=5 * inch, height=2.5 * inch))
            story.append(Spacer(1, 0.25 * inch))

        if model_type in ['conversions', 'both']:
            plt.figure(figsize=(6, 3))
            actual_convs = [row.get('actual_conversions', 0) for row in results]
            predicted_convs = [row.get('conversions', 0) for row in results]
            labels = [f"Row {i+1}" for i in range(len(results))]
            x = range(len(labels))
            plt.bar(x, actual_convs, width=0.4, label='Actual Conversions', color='#1E90FF', align='center')
            plt.bar([i + 0.4 for i in x], predicted_convs, width=0.4, label='Predicted Conversions', color='#32CD32', align='center')
            plt.xticks([i + 0.2 for i in x], labels, rotation=45, ha='right')
            plt.title('Actual vs Predicted Conversions', fontsize=12, fontweight='bold')
            plt.ylabel('Conversions')
            plt.legend()
            plt.tight_layout()
            plt.savefig('conv_upload_chart.png', bbox_inches='tight', dpi=100)
            plt.close()
            story.append(Image('conv_upload_chart.png', width=5 * inch, height=2.5 * inch))
            story.append(Spacer(1, 0.25 * inch))

    # Dashboard Trends
    story.append(Paragraph("Dashboard Trends", styles['SectionTitle']))
    times = [entry['time'][-8:-3] for entry in dashboard_data]

    if model_type in ['roi', 'both']:
        rois = [entry['roi'] for entry in dashboard_data]
        plt.figure(figsize=(6, 3))
        plt.plot(times, rois, label='ROI', color='#1E90FF', linewidth=2, marker='o')
        plt.title('ROI Over Time', fontsize=12, fontweight='bold')
        plt.xlabel('Time (HH:MM)', fontsize=10)
        plt.ylabel('ROI', fontsize=10)
        plt.legend(loc='upper left', fontsize=8)
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.xticks(rotation=45, ha='right', fontsize=8)
        plt.tight_layout()
        plt.savefig('roi_trend_chart.png', bbox_inches='tight', dpi=100)
        plt.close()
        story.append(Image('roi_trend_chart.png', width=5 * inch, height=2.5 * inch))
        story.append(Spacer(1, 0.25 * inch))

    if model_type in ['conversions', 'both']:
        conversions = [entry['conversions'] for entry in dashboard_data]
        plt.figure(figsize=(6, 3))
        plt.plot(times, conversions, label='Conversions', color='#32CD32', linewidth=2, marker='o')
        plt.title('Conversions Over Time', fontsize=12, fontweight='bold')
        plt.xlabel('Time (HH:MM)', fontsize=10)
        plt.ylabel('Conversions', fontsize=10)
        plt.legend(loc='upper left', fontsize=8)
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.xticks(rotation=45, ha='right', fontsize=8)
        plt.tight_layout()
        plt.savefig('conv_trend_chart.png', bbox_inches='tight', dpi=100)
        plt.close()
        story.append(Image('conv_trend_chart.png', width=5 * inch, height=2.5 * inch))
        story.append(Spacer(1, 0.25 * inch))

    # Suggestions
    story.append(Paragraph("Actionable Suggestions", styles['SectionTitle']))
    if not suggestions.strip():
        story.append(Paragraph("No specific suggestions provided.", styles['CustomBodyText']))
    else:
        for suggestion in suggestions.split('\n'):
            if suggestion.strip():
                story.append(Paragraph(f"• {suggestion}", styles['Suggestion']))

    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)

    for file in ['roi_upload_chart.png', 'conv_upload_chart.png', 'roi_trend_chart.png', 'conv_trend_chart.png']:
        if os.path.exists(file):
            os.remove(file)