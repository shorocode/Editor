// main.js - فایل اصلی اپلیکیشن

// ماژول‌های اصلی
import EditorManager from './modules/editorManager.js';
import FrameworkManager from './modules/frameworkManager.js';
import OutputManager from './modules/outputManager.js';
import StorageManager from './modules/storageManager.js';
import UIManager from './modules/uiManager.js';
import PackageManager from './modules/packageManager.js';

class CodeEditorApp {
  constructor() {
    // Initialize Managers
    this.uiManager = new UIManager();
    this.storageManager = new StorageManager();
    this.frameworkManager = new FrameworkManager();
    this.packageManager = new PackageManager();
    this.editorManager = new EditorManager();
    this.outputManager = new OutputManager();
    
    // Load dependencies
    this.loadDependencies();
    
    // Initialize app
    this.initApp();
  }

  async loadDependencies() {
    // بارگذاری CodeMirror و سایر کتابخانه‌ها
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js');
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/htmlmixed/htmlmixed.min.js');
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/css/css.min.js');
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js');
    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify.min.js');
    
    // بارگذاری فونت‌آیسم
    await this.loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadStylesheet(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  initApp() {
    // Initialize all components
    this.uiManager.init({
      onThemeChange: (isDark) => this.handleThemeChange(isDark),
      onRunCode: () => this.runCode(),
      onSaveCode: () => this.saveCode(),
      // سایر کالبک‌ها
    });
    
    this.editorManager.init({
      onCodeChange: () => this.handleCodeChange()
    });
    
    this.frameworkManager.init({
      onFrameworkChange: (framework) => this.handleFrameworkChange(framework)
    });
    
    // بارگذاری کدهای ذخیره شده
    this.loadSavedCode();
    
    // نمایش وضعیت اولیه
    this.uiManager.updateStatus('آماده');
  }

  handleThemeChange(isDark) {
    this.uiManager.toggleDarkMode(isDark);
    this.storageManager.saveSetting('theme', isDark ? 'dark' : 'light');
  }

  handleCodeChange() {
    if (this.uiManager.isAutoRunEnabled()) {
      this.debouncedRunCode();
    }
  }

  handleFrameworkChange(framework) {
    this.frameworkManager.setCurrentFramework(framework);
    this.uiManager.updateStatus(`فریمورک ${framework || 'بدون فریمورک'} انتخاب شد`);
    this.runCode();
  }

  debouncedRunCode = debounce(() => this.runCode(), 800);

  async runCode() {
    try {
      const html = this.editorManager.getHtmlCode();
      const css = this.editorManager.getCssCode();
      const js = this.editorManager.getJsCode();
      const framework = this.frameworkManager.getCurrentFramework();
      
      await this.outputManager.runCode({ html, css, js, framework });
      
      this.uiManager.updateStatus('کد با موفقیت اجرا شد', 'success');
      this.uiManager.showToast('پیش‌نمایش به‌روزرسانی شد', 'success');
    } catch (error) {
      console.error('Error running code:', error);
      this.uiManager.updateStatus(`خطا: ${error.message}`, 'error');
      this.uiManager.showToast('خطا در اجرای کد', 'error');
    }
  }

  saveCode() {
    try {
      const code = {
        html: this.editorManager.getHtmlCode(),
        css: this.editorManager.getCssCode(),
        js: this.editorManager.getJsCode()
      };
      
      this.storageManager.saveCode(code);
      this.uiManager.updateStatus('کدها ذخیره شدند', 'success');
      this.uiManager.showToast('کدها با موفقیت ذخیره شدند', 'success');
    } catch (error) {
      console.error('Error saving code:', error);
      this.uiManager.updateStatus('خطا در ذخیره‌سازی', 'error');
      this.uiManager.showToast('خطا در ذخیره‌سازی', 'error');
    }
  }

  loadSavedCode() {
    const savedCode = this.storageManager.getSavedCode();
    if (savedCode) {
      this.editorManager.setHtmlCode(savedCode.html || '');
      this.editorManager.setCssCode(savedCode.css || '');
      this.editorManager.setJsCode(savedCode.js || '');
      this.uiManager.showToast('کدهای ذخیره شده بارگذاری شدند', 'info');
    }
  }

  // سایر متدهای اصلی...
}

// تابع کمکی debounce
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// راه‌اندازی اپلیکیشن
document.addEventListener('DOMContentLoaded', () => {
  const app = new CodeEditorApp();
  window.app = app; // برای دسترسی از کنسول (فقط در حالت توسعه)
});
