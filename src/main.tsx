import { createRoot } from 'react-dom/client'
import React from 'react'
import App from './App.tsx'
import './index.css'
import { debug } from './lib/debug'

// تسجيل بداية تحميل التطبيق (وتجاهل الخطأ إذا كانت الوظيفة غير موجودة)
try {
  debug.performance?.recordEvent?.('بداية تحميل التطبيق');
} catch (e) {
  console.log('[تشخيص] بداية تحميل التطبيق');
}

// إضافة كاشف الأخطاء العام
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, errorInfo: React.ErrorInfo | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    debug.logError(error, 'ErrorBoundary');
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // يمكنك تخصيص واجهة الخطأ هنا
      return (
        <div dir="rtl" style={{
          margin: '20px',
          padding: '20px',
          border: '1px solid #f56565',
          borderRadius: '5px',
          backgroundColor: '#fff5f5',
          color: '#c53030',
          fontFamily: 'Tajawal, sans-serif'
        }}>
          <h2>حدث خطأ في التطبيق</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>تفاصيل الخطأ</summary>
            <p>{this.state.error?.toString()}</p>
            <p>موقع الخطأ:</p>
            <pre style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#edf2f7',
              color: '#2d3748',
              overflow: 'auto',
              maxHeight: '200px',
              direction: 'ltr',
              textAlign: 'left'
            }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// تفعيل وضع التطوير للكشف عن الأخطاء
if (process.env.NODE_ENV !== 'production') {
  console.log('تطبيق يعمل في وضع التطوير - سيتم عرض الأخطاء بشكل مفصل');
  
  // إضافة أداة التشخيص للكائن العام
  window['appDebug'] = debug;
  console.info('يمكنك الوصول لأداة التشخيص عبر: window.appDebug');
}

// محاولة الكشف عن أي مشاكل في الصفحة البيضاء
window.onerror = function(message, source, lineno, colno, error) {
  debug.logError(error || message.toString(), 'window.onerror');
  console.error('خطأ عام في التطبيق:', { message, source, lineno, colno, error });
  
  // إذا كانت الصفحة فارغة وحدث خطأ، اعرض رسالة للمستخدم
  const rootElement = document.getElementById('root');
  if (rootElement && (rootElement.childNodes.length === 0 || !rootElement.innerHTML.trim())) {
    rootElement.innerHTML = `
      <div dir="rtl" style="margin: 20px; padding: 20px; border: 1px solid #f56565; border-radius: 5px; background-color: #fff5f5; color: #c53030; font-family: Tajawal, sans-serif;">
        <h2>حدث خطأ أثناء تحميل التطبيق</h2>
        <p>نوع الخطأ: ${message}</p>
        <p>المصدر: ${source}</p>
        <p>الموقع: السطر ${lineno}، العمود ${colno}</p>
        <details style="margin-top: 10px;">
          <summary>تفاصيل إضافية</summary>
          <pre style="margin-top: 10px; padding: 10px; background-color: #edf2f7; color: #2d3748; overflow: auto; max-height: 200px; direction: ltr; text-align: left;">
            ${error?.stack || 'لا توجد تفاصيل إضافية'}
          </pre>
        </details>
        <div style="margin-top: 15px">
          <button 
            onclick="window.location.reload()"
            style="padding: 8px 16px; background-color: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    `;
  }
  return false;
};

// إضافة مستمع لمراقبة أي استثناءات غير معالجة
window.addEventListener('unhandledrejection', function(event) {
  debug.logError(`وعد غير معالج: ${event.reason}`, 'unhandledrejection');
  console.error('وعد غير معالج:', event.reason);
});

try {
  // تسجيل بدء تثبيت التطبيق (وتجاهل الخطأ إذا كانت الوظيفة غير موجودة)
  try {
    debug.performance?.recordEvent?.('بدء تثبيت التطبيق');
  } catch (e) {
    console.log('[تشخيص] بدء تثبيت التطبيق');
  }

  // استخدام ErrorBoundary للتطبيق
  const root = createRoot(document.getElementById("root")!)
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // تسجيل اكتمال تثبيت التطبيق (وتجاهل الخطأ إذا كانت الوظيفة غير موجودة)
  try {
    debug.performance?.recordEvent?.('اكتمال تثبيت التطبيق');
  } catch (e) {
    console.log('[تشخيص] اكتمال تثبيت التطبيق');
  }
} catch (error) {
  debug.logError(error instanceof Error ? error : new Error(String(error)), 'main.tsx');
  console.error('خطأ أثناء تحميل التطبيق:', error);
  
  // محاولة عرض معلومات الخطأ في الصفحة
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div dir="rtl" style="margin: 20px; padding: 20px; border: 1px solid #f56565; border-radius: 5px; background-color: #fff5f5; color: #c53030; font-family: Tajawal, sans-serif;">
        <h2>فشل تحميل التطبيق</h2>
        <p>حدث خطأ أثناء محاولة بدء التطبيق. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.</p>
        <details style="margin-top: 10px;">
          <summary>تفاصيل الخطأ</summary>
          <pre style="margin-top: 10px; padding: 10px; background-color: #edf2f7; color: #2d3748; overflow: auto; max-height: 200px; direction: ltr; text-align: left;">
            ${error instanceof Error ? error.stack || error.message : String(error)}
          </pre>
        </details>
        <div style="margin-top: 15px">
          <button 
            onclick="window.location.reload()"
            style="padding: 8px 16px; background-color: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    `;
  }
}
