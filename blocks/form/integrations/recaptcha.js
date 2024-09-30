export default class GoogleReCaptcha {
  id;

  config; 

  loadPromise;

  constructor(config, id) {
    this.config = config;
    this.id = id;
  }

  #loadScript(url) {
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const captchaWrapper = document.getElementsByClassName('captcha-wrapper')[0];
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.grecaptcha);
        script.onerror = () => reject(new Error(`Failed to load script ${url}`));
        captchaWrapper.appendChild(script);
        const newDiv = document.createElement('div');
        newDiv.classList.add('g-recaptcha'); 
        newDiv.setAttribute('data-sitekey', this.config.siteKey); 
        captchaWrapper.appendChild(newDiv);
      });
    }
  }

  loadCaptcha(form) {
    if (form && this.config.siteKey) {
      const submit = form.querySelector('button[type="submit"]');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siteKey = this.config.siteKey;
            const url = this.config.uri ;
            if(this.config.version == 'v2' || this.config.version == 'enterprise'){
                this.#loadScript(url);
            }
            // else if(this.config.version == 'enterprise'){
            //   let queryParams =  "?onload=onloadRecaptchaCallback&render=explicit";
            //   this.#loadScript(url + queryParams);
            // }
            else{
              this.#loadScript('https://www.recaptcha.net/recaptcha/api.js?render=' + siteKey);
            }
            obs.disconnect();
          }
        });
      });
      if(submit==null){
        console.error('Submit button is not defined');
        alert('Submit button is not defined. Add a submit button to the form');
      }
      else
        obs.observe(submit);
    }
    else{
      console.warn('Form or siteKey is not defined');
      alert('can not load captcha. Form or siteKey is not defined');
    }
  }

  async getToken() {
    if (!this.config.siteKey) {
      return null;
    }
    return new Promise((resolve) => {
      const { grecaptcha } = window;
      grecaptcha.ready(async () => {
        const token = await grecaptcha.execute(this.config.siteKey, { action: 'submit' });
        resolve(token);
      });
    });
  }
}