/**
 * jspsych-iat
 * Kristin Diep
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins['iat-html'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'iat-html',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed.'
      },
      left_category_key: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Left category key',
        default: 'E',
        description: 'Key press that is associated with the left category label.'
      },
      right_category_key: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Right category key',
        default: 'I',
        description: 'Key press that is associated with the right category label.'
      },
      left_category_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Left category label',
        array: true,
        default: ['left'],
        description: 'The label that is associated with the stimulus. Aligned to the left side of page.'
      },
      right_category_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Right category label',
        array: true,
        default: ['right'],
        description: 'The label that is associated with the stimulus. Aligned to the right side of the page.'
      },
      key_to_move_forward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key to move forward',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys that allow the user to advance to the next trial if their key press was incorrect.'
      },
      display_feedback: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Display feedback',
        default: false,
        description: 'If true, then html when wrong will be displayed when user makes an incorrect key press.'
      },
      html_when_wrong: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'HTML when wrong',
        default: '<span style="color: red; font-size: 80px">X</span>',
        description: 'The image to display when a user presses the wrong key.'
      },
      bottom_instructions: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Bottom instructions',
        default: '<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>',
        description: 'Instructions shown at the bottom of the page.'
      },
      force_correct_key_press: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Force correct key press',
        default: false,
        description: 'If true, in order to advance to the next trial after a wrong key press the user will be forced to press the correct key.'
      },
      stim_key_association: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus key association',
        options: ['left', 'right'],
        default: 'undefined',
        description: 'Stimulus will be associated with eight "left" or "right".'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
    }
  };


  plugin.trial = function (display_element, trial) {

    var left_labels = "<p>Press <span class='light-keys'><kbd>" + trial.left_category_key + "</kbd></span> for:</br>";
    var right_labels = "<p>Press <span class='light-keys'><kbd>" + trial.right_category_key + "</kbd></span> for:</br>";

    if (trial.left_category_label.length == 1) {
      left_labels += trial.left_category_label[0].bold() + "</p>";
    } else {
      left_labels += trial.left_category_label[0].bold() + "</br>or</br>" + trial.left_category_label[1].bold() + "</p>";
    }

    if (trial.right_category_label.length == 1) {
      right_labels += trial.right_category_label[0].bold() + "</p>";
    } else {
      right_labels += trial.right_category_label[0].bold() + "</br>or</br>" + trial.right_category_label[1].bold() + "</p>";
    }

    var html_str = "";

    html_str +=
      "<table class='iat_table' style='width: 100%; table-layout: fixed;'>" +
        "<tr>" +
          "<td style='width: 20%;'>" + left_labels + "</td>" +
          "<td></td>" +
          "<td style='width: 20%;'>" + right_labels + "</td>" +
        "</tr>" +
      "</table>";
    
    html_str += "<p id='jspsych-iat-stim' style='margin: 200px 0px 180px 0px;'>" + trial.stimulus.bold() + "</p>";

    html_str += "<div id='wrongImgID'>";
    if (trial.display_feedback === true) {
      html_str += "<div id='wrongImgContainer' style='visibility: hidden;'><p>" + trial.html_when_wrong + "</p></div>";
      html_str += "<p id='bottom_instructions'>" + trial.bottom_instructions + "</p>";
    };

    html_str += "</div>";

    display_element.innerHTML = html_str;


    // store response
    var response = {
      rt: null,
      key: null,
      correct: false
    };

    // function to end trial when it is time
    var end_trial = function () {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "correct": response.correct
      };

      // clears the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var leftKeyCode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.left_category_key);
    var rightKeyCode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.right_category_key);

    // function to handle responses by the subject
    var after_response = function (info) {
      var wImg = document.getElementById("wrongImgContainer");
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-iat-stim').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.stim_key_association == "right") {
        if (response.rt !== null && response.key == rightKeyCode) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if (!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            if (trial.force_correct_key_press) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.right_category_key]
              });
            } else {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: [jsPsych.ALL_KEYS]
            });
          } else if (!trial.response_ends_trial && trial.display_feedback != true) {

          }
        }
      } else if (trial.stim_key_association == "left") {
        if (response.rt !== null && response.key == leftKeyCode) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if (!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            if (trial.force_correct_key_press) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.left_category_key]
              });
            } else {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });
            }
          } else if (trial.response_ends_trial && trial.display_feedback != true) {
            var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: [jsPsych.ALL_KEYS]
            });
          } else if (!trial.response_ends_trial && trial.display_feedback != true) {

          }
        }
      }
    };

    // start the response listener
    if (trial.left_category_key != jsPsych.NO_KEYS && trial.right_category_key != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.left_category_key, trial.right_category_key],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null && trial.response_ends_trial != true) {
      jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
