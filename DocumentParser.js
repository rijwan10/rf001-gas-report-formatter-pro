/**
 * DocumentParser.js - 文書解析・構造化エンジン
 */

const DocumentParser = {
  
  parse(fileId) {
    try {
      const fileData = FileHandler.readFile(fileId);
      
      switch (fileData.type) {
        case 'google_doc':
          return this.parseGoogleDoc(fileData);
        case 'pdf':
          return this.parsePdf(fileData);
        case 'text':
          return this.parseTextFile(fileData);
        default:
          return this.parseTextFile(fileData);
      }
      
    } catch (error) {
      Logger.log('Document parsing error: ' + error.toString());
      throw new Error('Failed to parse document: ' + error.message);
    }
  },
  
  parseGoogleDoc(fileData) {
    try {
      const structured = {
        title: fileData.title,
        type: 'structured_document',
        sections: [],
        metadata: {
          originalType: 'google_doc',
          fileName: fileData.fileName,
          parseTime: new Date().toISOString()
        }
      };
      
      let currentSection = null;
      
      if (fileData.elements && fileData.elements.length > 0) {
        fileData.elements.forEach(element => {
          switch (element.type) {
            case 'paragraph':
              const text = element.text.trim();
              if (this.isHeading(text)) {
                if (currentSection) {
                  structured.sections.push(currentSection);
                }
                currentSection = {
                  title: text,
                  type: 'section',
                  content: [],
                  level: this.getHeadingLevel(text)
                };
              } else if (text.length > 0) {
                if (!currentSection) {
                  currentSection = {
                    title: 'Introduction',
                    type: 'section',
                    content: [],
                    level: 1
                  };
                }
                currentSection.content.push({
                  type: 'text',
                  content: text
                });
              }
              break;
              
            case 'table':
              if (!currentSection) {
                currentSection = {
                  title: 'Data Section',
                  type: 'section',
                  content: [],
                  level: 1
                };
              }
              currentSection.content.push({
                type: 'table',
                data: element.data
              });
              break;
              
            case 'list':
              if (!currentSection) {
                currentSection = {
                  title: 'List Section',
                  type: 'section',
                  content: [],
                  level: 1
                };
              }
              currentSection.content.push({
                type: 'list_item',
                content: element.text
              });
              break;
          }
        });
      } else {
        currentSection = {
          title: 'Document Content',
          type: 'section',
          content: [{
            type: 'text',
            content: fileData.content || 'No content available'
          }],
          level: 1
        };
      }
      
      if (currentSection) {
        structured.sections.push(currentSection);
      }
      
      return structured;
      
    } catch (error) {
      Logger.log('Google Doc parsing error: ' + error.toString());
      throw new Error('Failed to parse Google Doc');
    }
  },
  
  parsePdf(fileData) {
    return {
      title: fileData.fileName.replace('.pdf', ''),
      type: 'structured_document',
      sections: [{
        title: 'PDF Content',
        type: 'section',
        content: [{
          type: 'text',
          content: fileData.content || 'PDF content processed successfully'
        }],
        level: 1
      }],
      metadata: {
        originalType: 'pdf',
        fileName: fileData.fileName,
        parseTime: new Date().toISOString(),
        note: 'PDF parsing has limitations in GAS environment'
      }
    };
  },
  
  parseTextFile(fileData) {
    try {
      const lines = (fileData.content || '').split('\n');
      const structured = {
        title: fileData.fileName ? fileData.fileName.replace(/\.[^/.]+$/, '') : 'Document',
        type: 'structured_document',
        sections: [],
        metadata: {
          originalType: 'text',
          fileName: fileData.fileName || 'unknown',
          parseTime: new Date().toISOString()
        }
      };
      
      let currentSection = null;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.length === 0) return;
        
        if (this.isHeading(trimmedLine)) {
          if (currentSection) {
            structured.sections.push(currentSection);
          }
          currentSection = {
            title: trimmedLine,
            type: 'section',
            content: [],
            level: this.getHeadingLevel(trimmedLine)
          };
        } else {
          if (!currentSection) {
            currentSection = {
              title: 'Content',
              type: 'section',
              content: [],
              level: 1
            };
          }
          currentSection.content.push({
            type: 'text',
            content: trimmedLine
          });
        }
      });
      
      if (currentSection) {
        structured.sections.push(currentSection);
      }
      
      if (structured.sections.length === 0) {
        structured.sections.push({
          title: 'Document Content',
          type: 'section',
          content: [{
            type: 'text',
            content: fileData.content || 'No content available'
          }],
          level: 1
        });
      }
      
      return structured;
      
    } catch (error) {
      Logger.log('Text file parsing error: ' + error.toString());
      throw new Error('Failed to parse text file');
    }
  },
  
  isHeading(text) {
    const headingPatterns = [
      /^\d+\.\s+.+/,
      /^#+\s+.+/,
      /^[A-Z][A-Z\s]+:?\s*$/,
      /^第\d+章.+/,
      /^■.+/,
      /^【.+】/,
      /^[IVX]+\.\s+.+/i,
    ];
    
    return headingPatterns.some(pattern => pattern.test(text.trim()));
  },
  
  getHeadingLevel(text) {
    const trimmed = text.trim();
    
    if (trimmed.match(/^#+/)) {
      return Math.min(trimmed.match(/^#+/)[0].length, 3);
    } else if (trimmed.match(/^\d+\./)) {
      return 2;
    } else if (trimmed.match(/^[A-Z][A-Z\s]+:?\s*$/)) {
      return 1;
    } else if (trimmed.match(/^[IVX]+\.\s+/i)) {
      return 1;
    } else {
      return 3;
    }
  }
};