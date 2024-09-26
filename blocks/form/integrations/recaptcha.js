export default class GoogleReCaptcha {
  id;

  siteKey;

  loadPromise;

  constructor(siteKey, id) {
    this.siteKey = siteKey;
    this.id = id;
  }

  #loadScript(url, siteKey) {
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        //const head = document.head || document.querySelector('head');
        const captchaWrapper = document.getElementsByClassName('captcha-wrapper')[0];
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.grecaptcha);
        script.onerror = () => reject(new Error(`Failed to load script ${url}`));
        captchaWrapper.appendChild(script);
        const newDiv = document.createElement('div');
        newDiv.classList.add('g-recaptcha'); // Optionally add a class to the new div
       

       // captchaWrapper.classList.add('g-recaptcha');
        newDiv.setAttribute('data-sitekey', this.siteKey); 
        captchaWrapper.appendChild(newDiv);
        //head.append(script);
        //if (captchaWrapper) {
          //if(window.currentMode === 'preview')
          
        //}
      });
    }
  }

  loadCaptcha(form) {
    if (form && this.siteKey) {
      const submit = form.querySelector('button[type="submit"]');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            //this.#loadScript(`https://www.google.com/recaptcha/api.js?render=${this.siteKey}`);
            this.#loadScript('https://www.recaptcha.net/recaptcha/api.js', this.siteKey);
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
      alert('Form or siteKey is not defined');
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