export default class GoogleReCaptcha {
  id;
  name; 
  config; 

  formName; 

  loadPromise;


  constructor(config, id, name ,formName) {
    this.config = config;
    this.name = name;
    this.id = id;
    this.formName = formName;
  }

  #loadScriptV2(url, form) {
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const captchaWrapper = form.getElementsByClassName('captcha-wrapper')[0];
        if(captchaWrapper == null){
          captchaWrapper = document.createElement('div');
        }
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
                this.#loadScriptV2(url, form);
            }
            else if(this.config.version == 'enterprise'){
              //if(window.currentMode !=='edit')
              this.#loadScript(url+'?render=' + siteKey);
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
        const submit_action = 'submit_'+this.formName+'_'+this.id;
        //const submit_action = 'submit_'+this.name;
        const token = await grecaptcha.enterprise.execute(this.config.siteKey, {action: submit_action});
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