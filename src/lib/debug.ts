/**
 * وظائف التشخيص - نسخة مبسطة للإنتاج
 */

// تسجيل بداية تحميل التطبيق
const appStartTime = Date.now();

// إعداد كائن التشخيص
export const debug = {
  // تسجيل الأخطاء - الوظيفة الأساسية المطلوبة للإنتاج
  errors: [] as Array<{
    timestamp: number;
    message: string;
    source?: string;
    stack?: string;
    componentInfo?: string;
  }>,

  // إضافة خطأ للسجل - النسخة المبسطة
  logError: (error: Error | string, componentInfo?: string) => {
    const errorObj = {
      timestamp: Date.now(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      componentInfo
    };
    
    debug.errors.push(errorObj);
    return errorObj;
  },

  // إضافة وظائف قياس الأداء البسيطة
  performance: {
    appStartTime,
    getElapsedTime: () => Date.now() - appStartTime + 'ms',
    recordEvent: (eventName: string) => {
      // سجل الحدث فقط عند التطوير
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEBUG] ${eventName}: +${Date.now() - appStartTime}ms`);
      }
      return Date.now() - appStartTime;
    }
  }
};

// تصدير كائن التشخيص
export default debug; 