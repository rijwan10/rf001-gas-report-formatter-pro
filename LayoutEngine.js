/**
 * LayoutEngine.js - プロフェッショナルレイアウトエンジン
 */

const LayoutEngine = {
  
  apply(parsedDocument, formatType = 'professional') {
    try {
      const layoutConfig = this.getLayoutConfig(formatType);
      
      const layoutResult = {
        title: parsedDocument.title,
        formatType: formatType,
        layout: layoutConfig,
        processedSections: [],
        metadata: {
          originalDocument: parsedDocument.metadata,
          layoutApplied: new Date().toISOString(),
          totalSections: parsedDocument.sections.length
        }
      };
      
      parsedDocument.sections.forEach((section, index) => {
        const processedSection = this.processSection(section, layoutConfig, index);
        layoutResult.processedSections.push(processedSection);
      });
      
      return layoutResult;
      
    } catch (error) {
      Logger.log('Layout application error: ' + error.toString());
      throw new Error('Failed to apply layout: ' + error.message);
    }
  },
  
  getLayoutConfig(formatType) {
    const configs = {
      professional: {
        name: 'McKinsey Professional',
        pageMargin: { top: 25, bottom: 25, left: 30, right: 25 },
        fonts: {
          heading1: { family: 'Arial', size: 18, bold: true },
          heading2: { family: 'Arial', size: 14, bold: true },
          heading3: { family: 'Arial', size: 12, bold: true },
          body: { family: 'Arial', size: 11 },
          caption: { family: 'Arial', size: 9, italic: true }
        },
        colors: {
          primary: '#000000',
          secondary: '#404040',
          accent: '#0066CC',
          background: '#FFFFFF'
        },
        spacing: {
          paragraphAfter: 6,
          sectionAfter: 12,
          listIndent: 18
        }
      },
      executive: {
        name: 'Executive Summary',
        pageMargin: { top: 30, bottom: 30, left: 35, right: 30 },
        fonts: {
          heading1: { family: 'Calibri', size: 20, bold: true },
          heading2: { family: 'Calibri', size: 16, bold: true },
          heading3: { family: 'Calibri', size: 14, bold: true },
          body: { family: 'Calibri', size: 12 },
          caption: { family: 'Calibri', size: 10, italic: true }
        },
        colors: {
          primary: '#1F1F1F',
          secondary: '#606060',
          accent: '#2E75B6',
          background: '#FFFFFF'
        },
        spacing: {
          paragraphAfter: 8,
          sectionAfter: 16,
          listIndent: 20
        }
      },
      consulting: {
        name: 'BCG Consulting Style',
        pageMargin: { top: 25, bottom: 25, left: 30, right: 25 },
        fonts: {
          heading1: { family: 'Helvetica', size: 16, bold: true },
          heading2: { family: 'Helvetica', size: 13, bold: true },
          heading3: { family: 'Helvetica', size: 11, bold: true },
          body: { family: 'Helvetica', size: 10 },
          caption: { family: 'Helvetica', size: 8, italic: true }
        },
        colors: {
          primary: '#000000',
          secondary: '#333333',
          accent: '#E31837',
          background: '#FFFFFF'
        },
        spacing: {
          paragraphAfter: 4,
          sectionAfter: 10,
          listIndent: 15
        }
      }
    };
    
    return configs[formatType] || configs.professional;
  },
  
  processSection(section, layoutConfig, sectionIndex) {
    try {
      const processedSection = {
        title: section.title,
        level: section.level,
        index: sectionIndex,
        styling: this.getSectionStyling(section.level, layoutConfig),
        processedContent: [],
        pageBreak: this.needsPageBreak(section, sectionIndex)
      };
      
      section.content.forEach((contentItem, itemIndex) => {
        const processedItem = this.processContentItem(contentItem, layoutConfig, itemIndex);
        processedSection.processedContent.push(processedItem);
      });
      
      return processedSection;
      
    } catch (error) {
      Logger.log('Section processing error: ' + error.toString());
      throw new Error('Failed to process section');
    }
  },
  
  getSectionStyling(level, layoutConfig) {
    const fontKey = `heading${Math.min(level, 3)}`;
    const font = layoutConfig.fonts[fontKey] || layoutConfig.fonts.body;
    
    return {
      font: font,
      color: level === 1 ? layoutConfig.colors.primary : layoutConfig.colors.secondary,
      spacing: {
        before: level === 1 ? layoutConfig.spacing.sectionAfter : layoutConfig.spacing.paragraphAfter,
        after: layoutConfig.spacing.paragraphAfter
      },
      alignment: 'LEFT'
    };
  },
  
  processContentItem(contentItem, layoutConfig, itemIndex) {
    switch (contentItem.type) {
      case 'text':
        return this.processTextItem(contentItem, layoutConfig);
      case 'table':
        return this.processTableItem(contentItem, layoutConfig);
      case 'list_item':
        return this.processListItem(contentItem, layoutConfig);
      default:
        return this.processDefaultItem(contentItem, layoutConfig);
    }
  },
  
  processTextItem(contentItem, layoutConfig) {
    return {
      type: 'text',
      content: contentItem.content,
      styling: {
        font: layoutConfig.fonts.body,
        color: layoutConfig.colors.primary,
        spacing: {
          after: layoutConfig.spacing.paragraphAfter
        },
        alignment: 'JUSTIFY'
      },
      formatting: {
        emphasis: this.detectEmphasis(contentItem.content),
        links: this.detectLinks(contentItem.content)
      }
    };
  },
  
  processTableItem(contentItem, layoutConfig) {
    return {
      type: 'table',
      data: contentItem.data,
      styling: {
        font: layoutConfig.fonts.body,
        headerFont: { ...layoutConfig.fonts.body, bold: true },
        borderColor: layoutConfig.colors.secondary,
        headerBackground: '#F5F5F5',
        cellPadding: 6,
        spacing: {
          before: layoutConfig.spacing.paragraphAfter,
          after: layoutConfig.spacing.paragraphAfter
        }
      },
      formatting: {
        hasHeader: this.detectTableHeader(contentItem.data),
        alignment: 'CENTER'
      }
    };
  },
  
  processListItem(contentItem, layoutConfig) {
    return {
      type: 'list_item',
      content: contentItem.content,
      styling: {
        font: layoutConfig.fonts.body,
        color: layoutConfig.colors.primary,
        indent: layoutConfig.spacing.listIndent,
        bullet: '•',
        spacing: {
          after: layoutConfig.spacing.paragraphAfter / 2
        }
      }
    };
  },
  
  processDefaultItem(contentItem, layoutConfig) {
    return {
      type: contentItem.type,
      content: contentItem.content || contentItem,
      styling: {
        font: layoutConfig.fonts.body,
        color: layoutConfig.colors.primary
      }
    };
  },
  
  needsPageBreak(section, sectionIndex) {
    return sectionIndex > 0 && section.level === 1;
  },
  
  detectEmphasis(text) {
    const emphasis = [];
    
    const boldPattern = /\*\*(.+?)\*\*|__(.+?)__/g;
    let match;
    while ((match = boldPattern.exec(text)) !== null) {
      emphasis.push({
        type: 'bold',
        text: match[1] || match[2],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    const italicPattern = /\*(.+?)\*|_(.+?)_/g;
    while ((match = italicPattern.exec(text)) !== null) {
      emphasis.push({
        type: 'italic',
        text: match[1] || match[2],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return emphasis;
  },
  
  detectLinks(text) {
    const links = [];
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    let match;
    
    while ((match = urlPattern.exec(text)) !== null) {
      links.push({
        url: match[1],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return links;
  },
  
  detectTableHeader(tableData) {
    if (!tableData || tableData.length === 0) return false;
    
    const firstRow = tableData[0];
    const secondRow = tableData[1];
    
    if (!secondRow) return false;
    
    const firstRowAllText = firstRow.every(cell => isNaN(parseFloat(cell)));
    const secondRowHasNumbers = secondRow.some(cell => !isNaN(parseFloat(cell)));
    
    return firstRowAllText && secondRowHasNumbers;
  }
};