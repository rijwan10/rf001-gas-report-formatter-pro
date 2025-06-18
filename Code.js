/**
 * RF001-GAS ReportFormatter Pro - メインコントローラー
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('ReportFormatter Pro - Professional Report Generator');
}

function doPost(e) {
  try {
    const action = e.parameter.action;
    const response = { success: false, message: '', data: null };
    
    switch(action) {
      case 'upload':
        response = handleFileUpload(e);
        break;
      case 'convert':
        response = handleConversion(e);
        break;
      default:
        response.message = 'Invalid action specified';
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Server error: ' + error.message,
        data: null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleFileUpload(e) {
  try {
    const fileBlob = e.parameter.file;
    const fileName = e.parameter.fileName || 'uploaded_file';
    
    if (!fileBlob) {
      return { success: false, message: 'No file provided' };
    }
    
    const result = FileHandler.processUpload(fileBlob, fileName);
    return { success: true, message: 'File uploaded successfully', data: result };
    
  } catch (error) {
    Logger.log('Upload Error: ' + error.toString());
    return { success: false, message: 'Upload failed: ' + error.message };
  }
}

function handleConversion(e) {
  try {
    const fileId = e.parameter.fileId;
    const formatType = e.parameter.formatType || 'professional';
    
    if (!fileId) {
      return { success: false, message: 'File ID required' };
    }
    
    const parsedContent = DocumentParser.parse(fileId);
    const layoutResult = LayoutEngine.apply(parsedContent, formatType);
    const pdfResult = PdfGenerator.generate(layoutResult);
    
    return { 
      success: true, 
      message: 'Conversion completed successfully',
      data: {
        originalFileId: fileId,
        convertedFileId: pdfResult.fileId,
        downloadUrl: pdfResult.downloadUrl,
        conversionTime: new Date().toISOString()
      }
    };
    
  } catch (error) {
    Logger.log('Conversion Error: ' + error.toString());
    return { success: false, message: 'Conversion failed: ' + error.message };
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function initializeProject() {
  Logger.log('RF001-GAS ReportFormatter Pro - Initializing...');
  
  const folders = FileHandler.createProjectFolders();
  Logger.log('Project folders created: ' + JSON.stringify(folders));
  
  const config = {
    projectName: 'RF001-GAS ReportFormatter Pro',
    version: '1.0.0',
    initialized: new Date().toISOString(),
    folders: folders
  };
  
  PropertiesService.getScriptProperties().setProperties({
    'PROJECT_CONFIG': JSON.stringify(config)
  });
  
  Logger.log('Project initialized successfully');
  return config;
}