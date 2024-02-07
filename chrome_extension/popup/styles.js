// Import the required components from the Lit Library 
import { css, unsafeCSS } from '../scripts/lit/lit-core.min.js';

/**
 * The object to access the API functions of the browser.
 * @constant
 * @type {{runtime: object, tabs: object, i18n: object}} BrowserAPI
 */
const brw = chrome;

export const sharedStyles = css`
    div {
        margin: 20px auto;
    }

    a:link,
    a:visited {
        color: inherit;
    }

    h2 {
        margin: 0.5em 0;
    }

    * {
        font-family: "Roboto", "Arial", sans-serif;
    }
`;

export const patternLinkStyles = css`
    a {
        text-decoration: none;
        cursor: pointer;
    }

    a:hover {
        text-decoration: underline;
    }
`;

export const actionButtonStyles = css`
    div span {
        color: #eb13bc;
        font-weight: bold;
        cursor: pointer;
        text-decoration: none;
        font-size: 1rem;
    }

    div span:hover {
        text-decoration: underline;
    }

    @media (prefers-color-scheme: dark) {
        div {
            color: #33bfde;
        }
    }
`;

export const patternsListStyles = css`
    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin: 10px 0;
    }
`;

// On/Off Flipswitch from https://proto.io/freebies/onoff/
export const onOffSwitchStyles = css`
    div {
        position: relative;
        width: 90px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }

    label {
        display: block;
        overflow: hidden;
        border: 2px solid #000000;
        border-radius: 50px;
    }

    input:enabled+label {
        cursor: pointer;
    }

    input:disabled+label {
        cursor: not-allowed;
    }

    .onoffswitch-inner {
        display: block;
        width: 200%;
        margin-left: -100%;
    }

    .onoffswitch-inner:before,
    .onoffswitch-inner:after {
        display: block;
        float: left;
        width: 50%;
        height: 30px;
        padding: 0;
        line-height: 30px;
        font-size: 14px;
        color: white;
        font-family: Trebuchet, Arial, sans-serif;
        font-weight: bold;
        box-sizing: border-box;
    }

    .onoffswitch-inner:before {
        content: "${unsafeCSS(brw.i18n.getMessage("buttonOnState"))}";
        padding-left: 10px;
        background-color: #369af7;
        color: #FFFFFF;
    }

    .onoffswitch-inner:after {
        content: "${unsafeCSS(brw.i18n.getMessage("buttonOffState"))}";
        padding-right: 10px;
        background-color: #EEEEEE;
        color: #999999;
        text-align: right;
    }

    .onoffswitch-switch {
        display: block;
        width: 20px;
        margin: 6px;
        background: #FFFFFF;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 56px;
        border-radius: 50px;
    }

    input:checked+label .onoffswitch-inner {
        margin-left: 0;
    }

    input:checked+label .onoffswitch-switch {
        right: 0px;
    }

    @media (prefers-color-scheme: dark) { 
        label {
            border: 2px solid #FFFFFF;
        }
    
        .onoffswitch-inner:before {
            background-color: #369af7;
            color: #000000;
        }
    }
`;


export const neuromorphicText = css`
   .neumorphic-text {
    padding: 10px;
    font-size: 1.2em;
    background-color: #f0f0f0;
    border-radius: 10px;
    box-shadow: 5px 5px 10px #bfbfbf, 
                -5px -5px 10px #ffffff; /* Neumorphic box-shadow */
    display: inline-block; /* Ensure box-shadow works properly */
}
.neumorphic-heading {
    font-size: 2rem; /* Adjust font size as needed */
    text-align: center;
    color: #222; /* Text color */
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), 
                 -2px -2px 4px rgba(255, 255, 255, 0.5); /* Neumorphic text shadow */
  }
  .neumorphic-text-2 {
            font-size: 24px;
            /* Adjust font size as needed */
            color: #333; /* Text color */
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5),
                        -1px -1px 2px rgba(0, 0, 0, 0.2); /* Neumorphic text-shadow */
        }
  .neumorphic-nav-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px; /* Adjust margin as needed */
  }

  .neumorphic-nav-button {
    font-size: 1.5rem; /* Adjust font size as needed */
    cursor: pointer;
    border: none;
    background-color: #f0f0f0; /* Light background color */
    color: #666; /* Text color */
    border-radius: 50%;
    width: 50px; /* Set width of the button */
    height: 50px; /* Set height of the button */
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px; /* Adjust margin as needed */
    box-shadow: 5px 5px 10px #bfbfbf, 
                -5px -5px 10px #ffffff; /* Neumorphic box-shadow */
    transition: all 0.3s ease; /* Add transition for smooth hover effect */
  }

  /* Add hover effect */
  .neumorphic-nav-button:hover {
    background-color: #e0e0e0; /* Lighter background color on hover */
    transform: translateY(-2px); /* Move the button slightly up */
  }
  .toggle-switch {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 28px;
            height: 28px;
            border-radius: 50%; /* Make the switch round */
            background-color: #e0e0e0; /* Light gray background color */
            box-shadow: inset 3px 3px 6px #c9c9c9, 
                        inset -3px -3px 6px #ffffff; /* Neumorphic box-shadow */
            transition: transform 0.3s ease; /* Add transition for smoother animation */
        }

        /* Style for checked state of the switch */
        .toggle-container input[type="checkbox"]:checked + label .toggle-switch {
            transform: translateX(26px); /* Move the switch to the right */
        }
`;
