/**

This module handles all animations

**/

window.animate=(function(){
	//private


	//import easingEffects from helpers
	easingEffects = helpers.easingEffects;


	//public:
	return{
		frameAnimator:function(onProgress,easingString,onComplete){
			var stepDecimal, easeDecimal, currentStep, easingFunction, totalSteps;

			currentStep = 0;
			totalSteps = 6;
			easingFunction = easingEffects[easingString] || easingEffects.linear;

			var animationFrame = function(){
				currentStep++;
				stepDecimal = currentStep/totalSteps;
				easeDecimal = easingFunction(stepDecimal);

				onProgress(easeDecimal);

				if(currentStep<totalSteps)
					helpers.requestAnimFrame.call(window,animationFrame);;
			};

			helpers.requestAnimFrame.call(window,animationFrame);
		}
	}

}())