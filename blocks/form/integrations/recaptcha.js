export default class GoogleReCaptcha {
  id;

  config; 

  loadPromise;

  constructor(config, id) {
    this.config = config;
    this.id = id;
  }

  #loadScriptV2(url) {
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

  #loadScript(url) {
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const head = document.head || document.querySelector('head');
        const script = document.createElement('script');
        script.id = 'recaptcha_script';
        script.src = url;
        script.async = true;
        script.onload = () => resolve(window.grecaptcha);
        script.onerror = () => reject(new Error(`Failed to load script ${url}`));
        head.append(script);
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
            if(this.config.version == 'v2'){
                this.#loadScriptV2(url);
            }
            else if(this.config.version == 'enterprise'){
              if(window.currentMode !=='edit')
              this.#loadScript(url+'?render=' + siteKey);
              else{
                const captcha_script = document.getElementById('recaptcha_script');
                if(captcha_script != null){
                  captcha_script.remove();
                }
              }
            }
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
      if(this.config.version == 'enterprise'){
        grecaptcha.enterprise.ready(async () => {
        const token = await grecaptcha.enterprise.execute(this.config.siteKey, {action: 'submit'});
        resolve(token); 
        });
      }
      else{
        grecaptcha.ready(async () => {
        if(this.config.version == 'v2'){
          const token = await grecaptcha.getResponse();
          resolve(token);
        }
        else{
          const token = await grecaptcha.execute(this.config.siteKey, { action: 'submit' });
          resolve(token);
        }
        
        });
      }
      
    });
  }
}