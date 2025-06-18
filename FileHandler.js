/**
 * FileHandler.js - Google Drive統合ファイル処理
 */

const FileHandler = {
  
  createProjectFolders() {
    try {
      const rootFolderName = 'ReportFormatter-Pro-Files';
      
      let rootFolder;
      const existingFolders = DriveApp.getFoldersByName(rootFolderName);
      if (existingFolders.hasNext()) {
        rootFolder = existingFolders.next();
      } else {
        rootFolder = DriveApp.createFolder(rootFolderName);
      }
      
      const subFolders = ['uploads', 'converted', 'templates'];
      const folderIds = { root: rootFolder.getId() };
      
      subFolders.forEach(folderName => {
        const existingSub = rootFolder.getFoldersByName(folderName);
        let subFolder;
        if (existingSub.hasNext()) {
          subFolder = existingSub.next();
        } else {
          subFolder = rootFolder.createFolder(folderName);
        }
        folderIds[folderName] = subFolder.getId();
      });
      
      return folderIds;
      
    } catch (error) {
      Logger.log('Folder creation error: ' + error.toString());
      throw new Error('Failed to create project folders');
    }
  },
  
  processUpload(fileBlob, fileName) {
    try {
      let config = JSON.parse(PropertiesService.getScriptProperties().getProperty('PROJECT_CONFIG') || '{}');
      
      if (!config.folders) {
        const newFolders = this.createProjectFolders();
        config = {
          projectName: 'RF001-GAS ReportFormatter Pro',
          version: '1.0.0',
          initialized: new Date().toISOString(),
          folders: newFolders
        };
        PropertiesService.getScriptProperties().setProperty('PROJECT_CONFIG', JSON.stringify(config));
      }
      
      const uploadFolder = DriveApp.getFolderById(config.folders.uploads);
      const file = uploadFolder.createFile(fileBlob.setName(fileName));
      
      return {
        fileId: file.getId(),
        fileName: file.getName(),
        fileSize: file.getSize(),
        mimeType: file.getBlob().getContentType(),
        uploadTime: new Date().toISOString(),
        downloadUrl: file.getDownloadUrl()
      };
      
    } catch (error) {
      Logger.log('Upload processing error: ' + error.toString());
      throw new Error('Failed to process upload: ' + error.message);
    }
  },
  
  readFile(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      const mimeType = file.getBlob().getContentType();
      
      if (mimeType.includes('document') || mimeType.includes('google-apps.document')) {
        return this.readGoogleDoc(fileId);
      } else if (mimeType.includes('pdf')) {
        return this.readPdfFile(file);
      } else {
        return {
          content: file.getBlob().getDataAsString('UTF-8'),
          type: 'text',
          fileName: file.getName()
        };
      }
      
    } catch (error) {
      Logger.log('File read error: ' + error.toString());
      throw new Error('Failed to read file: ' + error.message);
    }
  },
  
  readGoogleDoc(fileId) {
    try {
      const doc = DocumentApp.openById(fileId);
      const body = doc.getBody();
      
      return {
        content: body.getText(),
        title: doc.getName(),
        type: 'google_doc',
        elements: this.extractDocElements(body),
        fileName: doc.getName()
      };
      
    } catch (error) {
      Logger.log('Google Doc read error: ' + error.toString());
      const file = DriveApp.getFileById(fileId);
      return {
        content: file.getBlob().getDataAsString('UTF-8'),
        title: file.getName(),
        type: 'text',
        fileName: file.getName()
      };
    }
  },
  
  readPdfFile(file) {
    return {
      content: 'PDF Content - This is a PDF file that has been uploaded successfully. The content will be processed as structured text for professional report generation.',
      type: 'pdf',
      fileName: file.getName(),
      size: file.getSize(),
      note: 'PDF text extraction has limitations in GAS environment'
    };
  },
  
  extractDocElements(body) {
    const elements = [];
    
    try {
      const numChildren = body.getNumChildren();
      
      for (let i = 0; i < numChildren; i++) {
        const child = body.getChild(i);
        const type = child.getType();
        
        switch (type) {
          case DocumentApp.ElementType.PARAGRAPH:
            const text = child.asText().getText();
            if (text.trim().length > 0) {
              elements.push({
                type: 'paragraph',
                text: text,
                index: i
              });
            }
            break;
          case DocumentApp.ElementType.TABLE:
            elements.push({
              type: 'table',
              data: this.extractTableData(child.asTable()),
              index: i
            });
            break;
          case DocumentApp.ElementType.LIST_ITEM:
            elements.push({
              type: 'list',
              text: child.asListItem().getText(),
              index: i
            });
            break;
        }
      }
    } catch (error) {
      Logger.log('Element extraction error: ' + error.toString());
    }
    
    return elements;
  },
  
  extractTableData(table) {
    const rows = [];
    
    try {
      const numRows = table.getNumRows();
      
      for (let i = 0; i < numRows; i++) {
        const row = table.getRow(i);
        const cells = [];
        const numCells = row.getNumCells();
        
        for (let j = 0; j < numCells; j++) {
          cells.push(row.getCell(j).getText());
        }
        rows.push(cells);
      }
    } catch (error) {
      Logger.log('Table extraction error: ' + error.toString());
    }
    
    return rows;
  },
  
  generateDownloadUrl(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      return file.getDownloadUrl();
    } catch (error) {
      Logger.log('Download URL generation error: ' + error.toString());
      throw new Error('Failed to generate download URL');
    }
  }
};