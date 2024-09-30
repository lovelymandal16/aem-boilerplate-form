export default class GoogleReCaptcha {
  id;

  //siteKey;
  config; 

  loadPromise;

  constructor(config, id) {
    //this.siteKey = siteKey;
    this.config = config;
    this.id = id;
  }

  #loadScript(url) {
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
        newDiv.setAttribute('data-sitekey', this.config.siteKey); 
        captchaWrapper.appendChild(newDiv);
        //head.append(script);
        //if (captchaWrapper) {
          //if(window.currentMode === 'preview')
          
        //}
      });
    }
  }


  // isRecaptchaEnterprise () {
  //   return this.config.version === "enterprise";
  // }

  // isScoreBasedKey() {
  //   return this.isRecaptchaEnterprise() && this.config.keyType === "score";
  // }
//allow no submit button if v2 and introduce a submit button if v3
  loadCaptcha(form) {
    if (form && this.config.siteKey) {
      const submit = form.querySelector('button[type="submit"]');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siteKey = this.config.siteKey;
            const url = this.config.uri ;//+ '?render=' + siteKey;
            if(this.config.version == 'v2'){
                this.#loadScript(url);
            }
            else if(this.config.version == 'enterprise'){
              //this.#loadScript(url + '?render=' + siteKey);
              //window.onloadRecaptchaCallback = onloadCallbackInternal;
              let queryParams = this.config.keyType === "score" ? "?render=" + siteKey: "?onload=onloadRecaptchaCallback&render=explicit";
              this.#loadScript(url + queryParams);
            }
            else{
              this.#loadScript('https://www.recaptcha.net/recaptcha/api.js?render=' + siteKey);
            }
            //else{
              //if(!(window.currentMode === 'preview')){
              //  this.#loadScript(url+ '?render=' + siteKey);
              //}
            //}
            // const siteKey = this.config.siteKey;
            // var url;  
            // if(this.config.version == 'v2')
            //   url = this.config.uri; 
            // else
            //   url = this.config.uri + '?render=' + siteKey;
            // //this.#loadScript('https://www.recaptcha.net/recaptcha/api.js', this.siteKey);
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