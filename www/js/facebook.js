var webFBObject;
var appFBObject;
window.fbAsyncInit = function() {
FB.init({
  appId      : '1712404159059619',
  xfbml      : true,
  version    : 'v2.9'
});
FB.AppEvents.logPageView();
webFBObject = FB;
};

(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  // This won't load unless on a server
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


function reloadFB() {
	var fbScript = document.getElementById('facebook-jssdk');
	var newFbScript = document.createElement('script');
	newFbScript.type = 'text/javascript';
	newFbScript.src = fbScript.src;
	fbScript.parentNode.removeChild(fbScript);
	document.body.insertBefore(newFbScript, document.getElementById('outer-container'));
}