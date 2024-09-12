export default class GoogleReCaptcha {
  id;

  siteKey;

  loadPromise;

  constructor(siteKey, id) {
    this.siteKey = siteKey;
    this.id = id;
  }

  #loadScript(url) {
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const head = document.head || document.querySelector('head');
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => resolve(window.grecaptcha);
        script.onerror = () => reject(new Error(`Failed to load script ${url}`));
        head.append(script);
      });
    }
  }

  loadCaptcha(form) {
    if (form && this.siteKey) {
      const submit = form.querySelector('button[type="submit"]');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.#loadScript(`https://www.google.com/recaptcha/api.js?render=${this.siteKey}`);
            obs.disconnect();
          }
        });
      });
      if(submit==null){
        console.error('Submit button is not defined');
      }
      else 
        obs.observe(submit);
    }
    else{
      console.warn('Form or siteKey is not defined');
    }
  }

  async getToken() {
    if (!this.siteKey) {
      return null;
    }
    return new Promise((resolve) => {
      const { grecaptcha } = window;
      grecaptcha.ready(async () => {
        const token = await grecaptcha.execute(this.siteKey, { action: 'submit' });
        resolve(token);
      });
    });
  }
}
