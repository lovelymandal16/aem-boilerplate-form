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

       // const dev_cap = document.head || document.querySelector('recaptcha-title2');
       // dev_cap.append();

        //if (!(document.documentElement.classList.contains('adobe-ue-edit')))
        head.append(script);
        //dev_cap.append(script);

       // const captcha_wrapper = document.getElementsByClassName('captcha-wrapper');
      //  if(captcha_wrapper!=null){
          const recaptchahtml = document.getElementsByClassName('grecaptcha-badge')[0];
          if(recaptchahtml != null){
            recaptchahtml.style.position = 'static';
            if(recaptchahtml.parentNode != null)
              recaptchahtml.parentNode.removeChild(recaptchahtml);
            const captcha_wrapper = document.getElementsByClassName('captcha-wrapper');
            if(captcha_wrapper!=null)
              captcha_wrapper[0].appendChild(recaptchahtml);
          }
       // }
        //const xyz_div = document.getElementById('test');
        //xyz_div.append(head);
        //captcha_wrapper[0].append(head);
      });
    }
  }

  loadCaptcha(form) {
    if (form && this.siteKey) {
      const submit = form.querySelector('button[type="submit"]');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
           // this.#loadScript(`https://www.google.com/recaptcha/api.js?render=${this.siteKey}`);
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
