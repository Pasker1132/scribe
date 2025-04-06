function getFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(function(key){
         formData.append(key, object[key]);
    });
    return formData;
}

var stripeSourceHandler = function(source, email, cardname, zip, location_id){

    location_id = location_id || false;

    // Insert the source ID into the form so it gets submitted to the server
    var form = document.getElementById('payment-form');

    var hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeSource');
    hiddenInput.setAttribute('value', source.id);

    var emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'hidden');
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('value', email);

    var cardnameInput = document.createElement('input');
    cardnameInput.setAttribute('type', 'hidden');
    cardnameInput.setAttribute('name', 'cardname');
    cardnameInput.setAttribute('value', cardname);

    var zipInput = document.createElement('input');
    zipInput.setAttribute('type', 'hidden');
    zipInput.setAttribute('name', 'zip_code');
    zipInput.setAttribute('value', zip);

    var ctime_input = document.createElement('INPUT');
    ctime_input.type  = 'hidden';
    ctime_input.name  = 'ctime';
    ctime_input.value = ctime;
    form.appendChild(ctime_input);

    var ctoken_input = document.createElement('INPUT');
    ctoken_input.type  = 'hidden';
    ctoken_input.name  = 'ctoken';
    ctoken_input.value = ctoken;

    if(stripePlan == 'alc' || stripePlan == 'alc_sub'){

        build_plan.sub = (stripePlan == 'alc_sub' ? true : false);

        var alc_input = document.createElement('INPUT');
        alc_input.type  = 'hidden';
        alc_input.name  = 'alc';
        alc_input.value = JSON.stringify(build_plan);
        form.appendChild(alc_input);

        if(oldSubscription){

            var oldsub_input = document.createElement('INPUT');
            oldsub_input.type  = 'hidden';
            oldsub_input.name  = 'old_sub';
            oldsub_input.value = oldSubscription;
            form.appendChild(oldsub_input);

        }

    } else if(stripePlan == 'scribeforce' || stripePlan == 'scribeforce_renew'){

        var seats_input = document.createElement('INPUT');
        seats_input.type  = 'hidden';
        seats_input.name  = 'seats';
        seats_input.value = ManagedAccounts.seats;
        form.appendChild(seats_input);

        var sc_name_input = document.createElement('INPUT');
        sc_name_input.type  = 'hidden';
        sc_name_input.name  = 'name';
        sc_name_input.value = ManagedAccounts.name;
        form.appendChild(sc_name_input);

        if(stripePlan == 'scribeforce_renew'){

            var sc_renew = document.createElement('INPUT');
            sc_renew.type  = 'hidden';
            sc_renew.name  = 'renew';
            sc_renew.value = 1;
            form.appendChild(sc_renew);

        }

    } else {

        var planInput = document.createElement('input');
        planInput.setAttribute('type', 'hidden');
        planInput.setAttribute('name', 'plan_id');
        planInput.setAttribute('value', stripePlan);
        form.appendChild(planInput);

    }

    form.appendChild(ctoken_input);

    form.appendChild(hiddenInput);
    form.appendChild(emailInput);

    if(location_id !== false){

        var server_input = document.createElement('INPUT');
        server_input.type  = 'hidden';
        server_input.name  = 'location_id';
        server_input.value = window.location_id;

        form.appendChild(server_input);

    }

    // Submit the form
    form.submit();

}

var buildStripeSubscriptionData = function(email, location_id){

    data = {};

    location_id = location_id || false;

    data.email = email;

    data.ctime = ctime;
    data.ctoken = ctoken;

    if(stripePlan == 'alc' || stripePlan == 'alc_sub'){

        build_plan.sub = (stripePlan == 'alc_sub' ? true : false);
        data.alc = JSON.stringify(build_plan);

        if(oldSubscription){

            data.old_sub = oldSubscription;

        }

    } else if(stripePlan == 'scribeforce' || stripePlan == 'scribeforce_renew'){

        data.seats = ManagedAccounts.seats;
        data.name = ManagedAccounts.name; 

        if(stripePlan == 'scribeforce_renew'){
            data.renew = 1;
        }

    } else {
        data.plan_id = stripePlan;
    }

    if(location_id !== false){
        data.location_id = window.location_id;
    }

    // if the form has an element with the id "stripe_voucher_code" send that as the promo code
    var promo_code = document.getElementById('stripe_voucher_code');
    promo_code = promo_code ? promo_code.value : false;
    if(promo_code){
        data.code = promo_code;
    }

    return data;
}


function registerElements(elements, formName, config) {
    var formClass = '.' + formName;
    var formContainer = document.querySelector(formClass);

    var form = formContainer.querySelector('form');
    var resetButton = formContainer.querySelector('a.reset');
    var error = form.querySelector('.error');
    var errorMessage = error.querySelector('.message');

    function enableInputs() {
        Array.prototype.forEach.call(
            form.querySelectorAll(
                "input[type='text'], input[type='email'], input[type='tel']"
            ),
            function(input) {
                input.removeAttribute('disabled');
            }
        );
    }

    function disableInputs() {
        Array.prototype.forEach.call(
            form.querySelectorAll(
                "input[type='text'], input[type='email'], input[type='tel']"
            ),
            function(input) {
                input.setAttribute('disabled', 'true');
            }
        );
    }

    function triggerBrowserValidation() {
        // The only way to trigger HTML5 form validation UI is to fake a user submit
        // event.
        var submit = document.createElement('input');
        submit.type = 'submit';
        submit.style.display = 'none';
        form.appendChild(submit);
        submit.click();
        submit.remove();
    }

    // Listen for errors from each Element, and show error messages in the UI.
    var savedErrors = {};
    elements.forEach(function(element, idx) {
        element.on('change', function(event) {
            if (event.error) {
                error.classList.add('visible');
                savedErrors[idx] = event.error.message;
                errorMessage.innerText = event.error.message;
            } else {
                savedErrors[idx] = null;

                // Loop over the saved errors and find the first one, if any.
                var nextError = Object.keys(savedErrors)
                    .sort()
                    .reduce(function(maybeFoundError, key) {
                        return maybeFoundError || savedErrors[key];
                    }, null);

                if (nextError) {
                    // Now that they've fixed the current error, show another one.
                    errorMessage.innerText = nextError;
                } else {
                    // The user fixed the last error; no more errors.
                    error.classList.remove('visible');
                }
            }
        });
    });

    // // Listen on the form's 'submit' handler...
    // form.addEventListener('submit', function(e) {
    //     e.preventDefault();

    //     var cardname = form.querySelector('#' + formName + '-name').value;
    //     var zip = form.querySelector('#' + formName + '-zip');

    //     if(cardname.length === 0){
    //         // Inform the user if there was an error
    //         var errorElement = document.getElementById('card-errors');
    //         errorElement.textContent = "Cardholder name is required";
    //         return;
    //     }

    //     if(zip.length === 0){
    //         // Inform the user if there was an error
    //         var errorElement = document.getElementById('card-errors');
    //         errorElement.textContent = "Zip/Postal Code is required";
    //         return;
    //     }

    //     // Trigger HTML5 validation UI on the form if any of the inputs fail
    //     // validation.
    //     var plainInputsValid = true;
    //     Array.prototype.forEach.call(form.querySelectorAll('input'), function(
    //         input
    //     ) {
    //         if (input.checkValidity && !input.checkValidity()) {
    //             plainInputsValid = false;
    //             return;
    //         }
    //     });
    //     if (!plainInputsValid) {
    //         triggerBrowserValidation();
    //         return;
    //     }

    //     // Show a loading screen...
    //     formContainer.classList.add('submitting');

    //     // Disable all inputs.
    //     disableInputs();

    //     var userEmail = form.querySelector('#' + formName + '-email').value;

    //     var descriptor = "Windscribe.com " + user_sd;

    //     stripe.createSource(elements[0], {
    //         type: 'card',
    //         currency: 'usd',
    //         owner: {
    //             email: userEmail,
    //             name: cardname,
    //             address: {
    //                 postal_code: zip,
    //             }
    //         },
    //         statement_descriptor: descriptor,
    //     }).then(function(result) {

    //         if (result.error) {

    //             formContainer.classList.remove('submitting');

    //             // Inform the user if there was an error
    //             var errorElement = document.getElementById('card-errors');
    //             errorElement.textContent = result.error.message;

    //             enableInputs();

    //         } else {

    //             // Send the source to your server
    //              var location_id = (config.location_id) ? config.location_id : false;
    //             stripeSourceHandler(result.source, userEmail, cardname, zip, location_id);

    //         }

    //     });

    // });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isGiftMode = new URLSearchParams(window.location.search).get('gift') === '1';

        var cardname = form.querySelector('#' + formName + '-name').value;
        var zip = form.querySelector('#' + formName + '-zip');

        if(cardname.length === 0){
            // Inform the user if there was an error
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = "Cardholder name is required";
            return;
        }

        if(zip.length === 0){
            // Inform the user if there was an error
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = "Zip/Postal Code is required";
            return;
        }

        error.classList.remove('visible');

        // Trigger HTML5 validation UI on the form if any of the inputs fail
        // validation.
        var plainInputsValid = true;
        Array.prototype.forEach.call(form.querySelectorAll('input'), function(
            input
        ) {
            if (input.checkValidity && !input.checkValidity()) {
                plainInputsValid = false;
                return;
            }
        });
        if (!plainInputsValid) {
            triggerBrowserValidation();
            return;
        }

        // Show a loading screen...
        formContainer.classList.add('submitting');

        // Disable all inputs.
        disableInputs();

        var userEmail = form.querySelector('#' + formName + '-email').value;

        // var descriptor = "Windscribe.com " + user_sd;

        // * - create payment method

        stripe.createPaymentMethod({
            type: 'card',
            card: elements[0],
            billing_details: {
              name: cardname,
              email: userEmail,
              address: {
                postal_code: zip,
              }
            },
          }).then(function(result) {

            if (result.error) {

                formContainer.classList.remove('submitting');

                // Inform the user if there was an error
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent = result.error.message;

                enableInputs();

            } else {

                // location_id is only set for static IP purchases
                var location_id = (config.location_id) ? config.location_id : false;

                // * - create subscription server side
                data = buildStripeSubscriptionData(userEmail, location_id);

                if(isGiftMode){
                    data.gift = {
                        fromName: $('#gift-from-name').val(),
                        toEmail: $('#gift-to-email').val(),
                        message: $('#gift-message').val()
                    };
                }

                // add the plan id and payment method id to the data object
                data.payment_method_id = result.paymentMethod.id;
                
                fetch('/stripe/subscription', {
                    method: 'post',
                    headers: {
                      'Content-type': 'application/json',
                    },
                    body: JSON.stringify(data),
                  }).then(function(subscriptionResponse) {

                    if(subscriptionResponse.status !== 200){
                        error.classList.add('visible');
                        errorMessage.innerText = "An error occurred, please try again";
                        formContainer.classList.remove('submitting');
                        enableInputs();
                        return;
                    }

                    subscriptionResponse.json().then(function(resData) {

                        // check if there is an error
                        if (resData.error) {

                            formContainer.classList.remove('submitting');

                            if(resData.message){
                                error.classList.add('visible');
                                errorMessage.innerText = resData.message;
                            }

                            if(resData.tf){
                                tf();
                            }

                            enableInputs();

                        } else {

                            // * - check subscription response for payment_intent
                            subscription = resData.subscription
                            paymentIntent = subscription?.latest_invoice?.payment_intent
                            
                            if(isGiftMode){
                                paymentIntent = resData.payment_intent;
                            }

                            if (subscription?.latest_invoice?.status === 'paid') {
                                // Invoice is already paid, treat as success
                                handlePaymentSuccess(data.seats > 0, isGiftMode);
                            } else {
                                // * - confirm card payment with the intent
                                stripe.confirmCardPayment(paymentIntent.client_secret, {
                                    payment_method: result.paymentMethod.id,
                                }).then(function(r) {
                                    if (r?.paymentIntent?.status === 'succeeded') {
                                        handlePaymentSuccess(data.seats > 0, isGiftMode);
                                    } else if (r.error && r.error.code === 'payment_intent_unexpected_state' && 
                                               r.error.payment_intent && r.error.payment_intent.status === 'succeeded') {
                                        // Payment intent has already succeeded, treat as success
                                        handlePaymentSuccess(data.seats > 0, isGiftMode);
                                    } else {
                                        err = r.error?.message || 'Your card was declined';
                                        handlePaymentError(err);
                                    }
                                }).catch(function(error) {
                                    handlePaymentError('An unexpected error occurred. Please try again.');
                                });
                            }
                        }

                    });

                  });
            }

        });

    });

    function handlePaymentError(messageText) {
        formContainer.classList.remove('submitting');
        // Inform the user if there was an error
        error.classList.add('visible');
        errorMessage.innerText = messageText;
        enableInputs();
    }

    function handlePaymentSuccess(sf, gift) {
        // redirect to success page
        spage = (!sf) ? '/payment/success' : '/payment/success?p=score';
        if(gift){
            spage += '/payment/success?gift=1';
        }
        window.location.href = spage;
    }

    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        // Resetting the form (instead of setting the value to `''` for each input)
        // helps us clear webkit autofill styles.
        form.reset();

        // Clear each Element.
        elements.forEach(function(element) {
            element.clear();
        });

        // Reset error state as well.
        error.classList.remove('visible');

        // Resetting the form does not un-disable inputs, so we need to do it separately:
        enableInputs();
        formContainer.classList.remove('submitted');
    });
}

var initStripe = function(config){


    var elements = stripe.elements({
        fonts: [
            {
                cssSrc: '/css/fonts/Quicksand-Regular.woff2',
            },
        ],
        locale: 'auto',
    });

    var elementStyles = {
        base: {
            color: '#3968BC75',
            fontWeight: 600,
            fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',

            ':focus': {
                color: '#424770',
            },

            '::placeholder': {
                color: '#3968BC75',
            },

            ':focus::placeholder': {
                color: '#3968BC75',
            },
        },
        invalid: {
            color: '#FFCCA5',
            ':focus': {
                color: '#FA755A',
            },
            '::placeholder': {
                color: '#FFCCA5',
            },
        },
    };

    var elementClasses = {
        focus: 'focus',
        empty: 'empty',
        invalid: 'invalid',
    };

    var cardNumber = elements.create('cardNumber', {
        style: elementStyles,
        classes: elementClasses,
    });
    cardNumber.mount('#ws-stripe-form-card-number');

    var cardExpiry = elements.create('cardExpiry', {
        style: elementStyles,
        classes: elementClasses,
    });
    cardExpiry.mount('#ws-stripe-form-card-expiry');

    var cardCvc = elements.create('cardCvc', {
        style: elementStyles,
        classes: elementClasses,
    });
    cardCvc.mount('#ws-stripe-form-card-cvc');

    registerElements([cardNumber, cardExpiry, cardCvc], 'ws-stripe-form', config);


};


/**
 * PaymentIntent API Subscriptions
 * 
 * steps:
 * - create payment method
 * - create subscription server side
 * - check subscription response for payment_intent
 * - confirm card payment with the intent
 */

// // create payment method
// stripe.createPaymentMethod({
//     type: 'card',
//     card: cardElement,
//     billing_details: {
//       name: fullName,
//     },
//   })

// // create new subscription in API
// fetch('/create-subscription', {
//     method: 'post',
//     headers: {
//       'Content-type': 'application/json',
//     },
//     body: JSON.stringify({
//       payment_method_id: paymentMethod.id,
//       plan_id: planId,
//     }),
//   })

//confirm card payment with the intent
// stripe.confirmCardPayment(paymentIntent.client_secret, {
//     payment_method: stripePaymentMethod?.id || '',
//   })