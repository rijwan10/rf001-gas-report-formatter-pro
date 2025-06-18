/**
 * PdfGenerator.js - Google Docs PDF生成エンジン
 */

const PdfGenerator = {
  
  generate(layoutResult) {
    try {
      const doc = this.createGoogleDoc(layoutResult);
      const pdfResult = this.convertToPdf(doc, layoutResult);
      
      return pdfResult;
      
    } catch (error) {
      Logger.log('PDF generation error: ' + error.toString());
      throw new Error('Failed to generate PDF: ' + error.message);
    }
  },
  
  createGoogleDoc(layoutResult) {
    try {
      const docName = `${layoutResult.title}_Formatted_${new Date().getTime()}`;
      const doc = DocumentApp.create(docName);
      const body = doc.getBody();
      
      this.applyDocumentSettings(doc, layoutResult.layout);
      this.addTitle(body, layoutResult.title, layoutResult.layout);
      
      layoutResult.processedSections.forEach((section, index) => {
        this.addSection(body, section, layoutResult.layout, index);
      });
      
      doc.saveAndClose();
      
      return {
        docId: doc.getId(),
        docName: docName,
        url: doc.getUrl()
      };
      
    } catch (error) {
      Logger.log('Google Doc creation error: ' + error.toString());
      throw new Error('Failed to create Google Doc');
    }
  },
  
  applyDocumentSettings(doc, layoutConfig) {
    try {
      const body = doc.getBody();
      
      body.setMarginTop(layoutConfig.pageMargin.top);
      body.setMarginBottom(layoutConfig.pageMargin.bottom);
      body.setMarginLeft(layoutConfig.pageMargin.left);
      body.setMarginRight(layoutConfig.pageMargin.right);
      
      body.setPageHeight(842); // A4
      body.setPageWidth(595);
      
    } catch (error) {
      Logger.log('Document settings error: ' + error.toString());
      throw new Error('Failed to apply document settings');
    }
  },
  
  addTitle(body, title, layoutConfig) {
    try {
      const titleParagraph = body.appendParagraph(title);
      const titleStyle = {};
      
      titleStyle[DocumentApp.Attribute.FONT_FAMILY] = layoutConfig.fonts.heading1.family;
      titleStyle[DocumentApp.Attribute.FONT_SIZE] = layoutConfig.fonts.heading1.size + 4;
      titleStyle[DocumentApp.Attribute.BOLD] = true;
      titleStyle[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
      titleStyle[DocumentApp.Attribute.SPACING_AFTER] = layoutConfig.spacing.sectionAfter * 2;
      
      titleParagraph.setAttributes(titleStyle);
      
      const separator = body.appendParagraph('_______________________________________________________________________________');
      const separatorStyle = {};
      separatorStyle[DocumentApp.Attribute.FONT_SIZE] = 8;
      separatorStyle[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
      separatorStyle[DocumentApp.Attribute.SPACING_AFTER] = layoutConfig.spacing.sectionAfter;
      separator.setAttributes(separatorStyle);
      
    } catch (error) {
      Logger.log('Title addition error: ' + error.toString());
      throw new Error('Failed to add title');
    }
  },
  
  addSection(body, section, layoutConfig, sectionIndex) {
    try {
      if (section.pageBreak && sectionIndex > 0) {
        body.appendPageBreak();
      }
      
      this.addSectionTitle(body, section, layoutConfig);
      
      section.processedContent.forEach(contentItem => {
        this.addContentItem(body, contentItem, layoutConfig);
      });
      
    } catch (error) {
      Logger.log('Section addition error: ' + error.toString());
      throw new Error('Failed to add section');
    }
  },
  
  addSectionTitle(body, section, layoutConfig) {
    try {
      const titleParagraph = body.appendParagraph(section.title);
      const titleStyle = {};
      
      const font = section.styling.font;
      titleStyle[DocumentApp.Attribute.FONT_FAMILY] = font.family;
      titleStyle[DocumentApp.Attribute.FONT_SIZE] = font.size;
      titleStyle[DocumentApp.Attribute.BOLD] = font.bold || false;
      titleStyle[DocumentApp.Attribute.ITALIC] = font.italic || false;
      titleStyle[DocumentApp.Attribute.SPACING_BEFORE] = section.styling.spacing.before;
      titleStyle[DocumentApp.Attribute.SPACING_AFTER] = section.styling.spacing.after;
      
      titleParagraph.setAttributes(titleStyle);
      
    } catch (error) {
      Logger.log('Section title error: ' + error.toString());
      throw new Error('Failed to add section title');
    }
  },
  
  addContentItem(body, contentItem, layoutConfig) {
    try {
      switch (contentItem.type) {
        case 'text':
          this.addTextItem(body, contentItem);
          break;
        case 'table':
          this.addTableItem(body, contentItem);
          break;
        case 'list_item':
          this.addListItem(body, contentItem);
          break;
        default:
          this.addDefaultItem(body, contentItem);
          break;
      }
    } catch (error) {
      Logger.log('Content item addition error: ' + error.toString());
      throw new Error('Failed to add content item');
    }
  },
  
  addTextItem(body, textItem) {
    try {
      const paragraph = body.appendParagraph(textItem.content);
      const style = {};
      
      const font = textItem.styling.font;
      style[DocumentApp.Attribute.FONT_FAMILY] = font.family;
      style[DocumentApp.Attribute.FONT_SIZE] = font.size;
      style[DocumentApp.Attribute.BOLD] = font.bold || false;
      style[DocumentApp.Attribute.ITALIC] = font.italic || false;
      style[DocumentApp.Attribute.SPACING_AFTER] = textItem.styling.spacing.after;
      
      if (textItem.styling.alignment === 'JUSTIFY') {
        style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.JUSTIFY;
      }
      
      paragraph.setAttributes(style);
      
      this.applyTextFormatting(paragraph, textItem.formatting);
      
    } catch (error) {
      Logger.log('Text item error: ' + error.toString());
      throw new Error('Failed to add text item');
    }
  },
  
  addTableItem(body, tableItem) {
    try {
      if (!tableItem.data || tableItem.data.length === 0) return;
      
      const tableData = tableItem.data;
      const numRows = tableData.length;
      const numCols = Math.max(...tableData.map(row => row.length));
      
      const table = body.appendTable(tableData);
      
      for (let i = 0; i < numRows; i++) {
        const row = table.getRow(i);
        for (let j = 0; j < numCols && j < tableData[i].length; j++) {
          const cell = row.getCell(j);
          const cellStyle = {};
          
          const font = (i === 0 && tableItem.formatting.hasHeader) ? 
            tableItem.styling.headerFont : tableItem.styling.font;
          
          cellStyle[DocumentApp.Attribute.FONT_FAMILY] = font.family;
          cellStyle[DocumentApp.Attribute.FONT_SIZE] = font.size;
          cellStyle[DocumentApp.Attribute.BOLD] = font.bold || false;
          
          if (i === 0 && tableItem.formatting.hasHeader) {
            cellStyle[DocumentApp.Attribute.BACKGROUND_COLOR] = '#F0F0F0';
          }
          
          cell.setAttributes(cellStyle);
        }
      }
      
      const tableStyle = {};
      tableStyle[DocumentApp.Attribute.SPACING_BEFORE] = tableItem.styling.spacing.before;
      tableStyle[DocumentApp.Attribute.SPACING_AFTER] = tableItem.styling.spacing.after;
      table.setAttributes(tableStyle);
      
    } catch (error) {
      Logger.log('Table item error: ' + error.toString());
      throw new Error('Failed to add table item');
    }
  },
  
  addListItem(body, listItem) {
    try {
      const paragraph = body.appendParagraph(listItem.content);
      const style = {};
      
      const font = listItem.styling.font;
      style[DocumentApp.Attribute.FONT_FAMILY] = font.family;
      style[DocumentApp.Attribute.FONT_SIZE] = font.size;
      style[DocumentApp.Attribute.INDENT_START] = listItem.styling.indent;
      style[DocumentApp.Attribute.SPACING_AFTER] = listItem.styling.spacing.after;
      
      paragraph.setAttributes(style);
      paragraph.setGlyphType(DocumentApp.GlyphType.BULLET);
      
    } catch (error) {
      Logger.log('List item error: ' + error.toString());
      throw new Error('Failed to add list item');
    }
  },
  
  addDefaultItem(body, item) {
    try {
      const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
      const paragraph = body.appendParagraph(content);
      
      const style = {};
      if (item.styling && item.styling.font) {
        style[DocumentApp.Attribute.FONT_FAMILY] = item.styling.font.family;
        style[DocumentApp.Attribute.FONT_SIZE] = item.styling.font.size;
      }
      
      paragraph.setAttributes(style);
      
    } catch (error) {
      Logger.log('Default item error: ' + error.toString());
      throw new Error('Failed to add default item');
    }
  },
  
  applyTextFormatting(paragraph, formatting) {
    try {
      if (!formatting) return;
      
      const text = paragraph.getText();
      
      if (formatting.emphasis) {
        formatting.emphasis.forEach(emphasis => {
          if (emphasis.type === 'bold' && emphasis.start < text.length) {
            const endIndex = Math.min(emphasis.end, text.length);
            paragraph.setBold(emphasis.start, endIndex - 1, true);
          }
          if (emphasis.type === 'italic' && emphasis.start < text.length) {
            const endIndex = Math.min(emphasis.end, text.length);
            paragraph.setItalic(emphasis.start, endIndex - 1, true);
          }
        });
      }
      
      if (formatting.links) {
        formatting.links.forEach(link => {
          if (link.start < text.length) {
            const endIndex = Math.min(link.end, text.length);
            paragraph.setLinkUrl(link.start, endIndex - 1, link.url);
          }
        });
      }
      
    } catch (error) {
      Logger.log('Text formatting error: ' + error.toString());
    }
  },
  
  convertToPdf(docInfo, layoutResult) {
    try {
      const doc = DocumentApp.openById(docInfo.docId);
      const blob = doc.getBlob().setName(`${layoutResult.title}_Professional.pdf`);
      
      const config = JSON.parse(PropertiesService.getScriptProperties().getProperty('PROJECT_CONFIG') || '{}');
      const convertedFolderId = config.folders?.converted;
      
      if (convertedFolderId) {
        const convertedFolder = DriveApp.getFolderById(convertedFolderId);
        const pdfFile = convertedFolder.createFile(blob);
        
        return {
          success: true,
          fileId: pdfFile.getId(),
          fileName: pdfFile.getName(),
          downloadUrl: pdfFile.getDownloadUrl(),
          size: pdfFile.getSize(),
          createdTime: new Date().toISOString(),
          sourceDocId: docInfo.docId,
          sourceDocUrl: docInfo.url
        };
      } else {
        const pdfFile = DriveApp.createFile(blob);
        return {
          success: true,
          fileId: pdfFile.getId(),
          fileName: pdfFile.getName(),
          downloadUrl: pdfFile.getDownloadUrl(),
          size: pdfFile.getSize(),
          createdTime: new Date().toISOString(),
          sourceDocId: docInfo.docId,
          sourceDocUrl: docInfo.url
        };
      }
      
    } catch (error) {
      Logger.log('PDF conversion error: ' + error.toString());
      throw new Error('Failed to convert to PDF: ' + error.message);
    }
  }
};