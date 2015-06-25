angular.module('ionic-firebase-seed', ['ionic', 'firebase'])

// TODO: Replace this with your own Firebase URL: https://firebase.com/signup
.constant('FBURL', 'https://ionic-fb-seed.firebaseio.com/')

.factory('Auth', function($firebaseAuth, FBURL) {
  var ref = new Firebase(FBURL);
  return $firebaseAuth(ref);
})

.factory('Messages', function($firebaseArray, FBURL) {
  var ref = new Firebase(FBURL + '/messages');
  return $firebaseArray(ref);
})

.controller('AppCtrl', function($scope, $ionicModal, Auth, Messages) {

  // MODALS

  // Create all of the modals
  var modals = ['message', 'login', 'signup'];

  $scope.createModal = function(modalName) {
    var modalURL = modalName + '.html';
    $ionicModal.fromTemplateUrl(modalURL, function(modal) {
      $scope[modalName + 'Modal'] = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });
  };

  angular.forEach(modals, function(modalName) {
    $scope.createModal(modalName);
  });

  $scope.showModal = function(modalType) {
    $scope[modalType + 'Modal'].show();
  };

  $scope.closeModal = function(modalType) {
    $scope[modalType + 'Modal'].hide();
  };

  // EMAIL & PASSWORD AUTHENTICATION

  // Check for the user's authentication state
  Auth.$onAuth(function(authData) {
    if (authData) {
      $scope.loggedInUser = authData;
    } else {
      $scope.loggedInUser = null;
    }
  });

  // Create a new user, called when a user submits the signup form
  $scope.createUser = function(user) {
    Auth.$createUser({
      email: user.email,
      password: user.pass
    }).then(function(userData) {
      // User created successfully, log them in
      return Auth.$authWithPassword({
        email: user.email,
        password: user.pass
      });
    }).then(function(authData) {
      console.log('Logged in successfully as: ', authData.uid);
      $scope.loggedInUser = authData;
      $scope.closeModal('signup');
    }).catch(function(error) {
      console.log('Error: ', error);
    });
  };

  // Login an existing user, called when a user submits the login form
  $scope.login = function(user) {
    Auth.$authWithPassword({
      email: user.email,
      password: user.pass
    }).then(function(authData) {
      console.log('Logged in successfully as: ', authData.uid);
      $scope.loggedInUser = authData;
      $scope.closeModal('login');
    }).catch(function(error) {
      console.log('Error: ', error);
    });
  };

  // Log a user out
  $scope.logout = function() {
    Auth.$unauth();
  };

  // ADD MESSAGES TO A SYNCHRONIZED ARRAY

  // Bind messages to the scope
  $scope.messages = Messages;

  // Add a message to a synchronized array using $add with $firebaseArray
  $scope.addMessage = function(message) {
    if ($scope.loggedInUser) {
      Messages.$add({
        email: $scope.loggedInUser.password.email,
        text: message.text
      });
      message.text = "";
      $scope.closeModal('message');
    }
  };

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});