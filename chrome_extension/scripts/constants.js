/**
 * The object to access the API functions of the browser.
 * @constant
 * @type {{runtime: object, i18n: object}} BrowserAPI
 */
const brw = chrome;

/**
 * Configuration of the pattern detection functions.
 * The following attributes must be specified for each pattern.
 *  - `name`: The name of the pattern that will be displayed on the UI.
 *  - `className`: A valid CSS class name for the pattern (used only internally and not displayed).
 *  - `detectionFunctions`: An array of functions `f(node, nodeOld)` to detect the pattern.
 *      Parameters of the functions are the HTML node to be examined in current and previous state (in this order).
 *      The functions must return `true` if the pattern was detected and `false` if not.
 *  - `infoUrl`: The URL to the explanation of the pattern on the `dapde.de` website.
 *  - `info`: A brief explanation of the pattern.
 *  - `languages`: An array of ISO 639-1 codes of the languages supported by the detection functions..
 * @constant
 * @type {{
 *  patterns: Array.<{
 *      name: string,
 *      className: string,
 *      detectionFunctions: Array.<Function>,
 *      infoUrl: string,
 *      info: string,
 *      languages: Array.<string>
 *  }>
 * }}
 */
export const patternConfig = {
    patterns: [
        {
            /**
             * Countdown Pattern.
             * Countdown patterns induce (truthfully or falsely) the impression that a product or service is only available for a certain period of time.
             * This is illustrated through a running clock or a lapsing bar.
             * You can watch as the desired good slips away.
             */
            name: brw.i18n.getMessage("patternCountdown_name"),
            className: "countdown",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element for the timer pattern.
                    // The previous state of the element is not used.

                    // Regular expression to match the timer pattern.
                    const timerRegex = /\b\d{1,2}h\s*:\s*\d{1,2}m\s*:\s*\d{1,2}s\b/i;

                    // Check if the text contains the timer pattern.
                    return timerRegex.test(node.innerText);
                },
                function (node, nodeOld) {
                    // Countdowns should only be identified as such if they are actively running and not static.
                    // Therefore, it is necessary to check first if there is an old state of the element and if the text in it has changed.
                    if (nodeOld && node.innerText != nodeOld.innerText) {
                        /**
                         * Regular expression for a usual countdown with or without words.
                         * @constant
                         */
                        const reg = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|d?|hours?|h?|minutes?|m?|seconds?|s?|tage?|stunden?|minuten?|sekunden?|[a-zA-Z]{1,3}\.?)(?:\s*und)?\s*){2,4}/gi;

                        /**
                         * Regular expression for strings that match the regular expression for countdowns
                         * but are not countdowns because there are too many numbers.
                         * A maximum of 4 numbers for days, hours, minutes and seconds is expected.
                         * @constant
                         */
                        const regBad = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|d?|hours?|h?|minutes?|m?|seconds?|s?|tage?|stunden?|minuten?|sekunden?|[a-zA-Z]{1,3}\.?)(?:\s*und)?\s*){5,}/gi;

                        // If matches for "wrong" countdowns are found with the second regular expression,
                        // remove these parts from the string.
                        // Then search for matches for real countdowns in the remaining string.
                        // Do this for the old and current state of the text.
                        let matchesOld = nodeOld.innerText.replace(regBad, "").match(reg);
                        let matchesNew = node.innerText.replace(regBad, "").match(reg);

                        // If no matches were found in one of the two states of the texts or
                        // if the number of matches in the two states does not match,
                        // the element is not classified as a countdown.
                        if (matchesNew == null || matchesOld == null ||
                            (matchesNew != null && matchesOld != null
                                && matchesNew.length != matchesOld.length)) {
                            return false;
                        }

                        // Since it was ensured at the point that there are the same number of matches
                        // in both states of the text, it is initially assumed that the matches with the same index
                        // in both states are the same countdown.
                        for (let i = 0; i < matchesNew.length; i++) {
                            // Extract all contiguous numbers from the strings.
                            // Example: `"23:59:58"` -> `["23", "59", "58"]`.
                            let numbersNew = matchesNew[i].match(/\d+/gi);
                            let numbersOld = matchesOld[i].match(/\d+/gi);

                            // If the number of each number does not match,
                            // then the pair of countdowns does not match.
                            if (numbersNew.length != numbersOld.length) {
                                // Ignore this pair and examine at the next one.
                                continue;
                            }

                            // Iterate through all pairs of numbers in the strings.
                            for (let x = 0; x < numbersNew.length; x++) {
                                // Since countdowns should be detected that are running down,
                                // the numbers from left to right become smaller over time.
                                // When the numbers are iterated from left to right,
                                // at least one number in the current state of the text
                                // should be smaller than in the old state.
                                // If a number in the current state is larger before a number
                                // is smaller than in the previous state, it does not seem to be an elapsing countdown.
                                // Examples: current state - previous state -> result
                                //           23,30,40      - 23,30,39       -> is a countdown
                                //           23,30,00      - 23,29,59       -> is a countdown
                                //           23,30,40      - 23,31,20       -> is not a countdown
                                //           23,30,40      - 23,30,41       -> is not a countdown
                                //           23,30,40      - 23,30,40       -> is not a countdown
                                if (parseInt(numbersNew[x]) > parseInt(numbersOld[x])) {
                                    // If the number in the current state is larger,
                                    // break out of the loop and examine the next pair, if present.
                                    // This case occurs only if the second if-clause did not occur and `true` was returned.
                                    break;
                                }
                                if (parseInt(numbersNew[x]) < parseInt(numbersOld[x])) {
                                    // Return `true` if a number has decreased.
                                    return true;
                                }
                            }
                        }
                    }
                    // Return `false` if no countdown was detected by the previous steps.
                    return false;
                }
            ],
            infoUrl: brw.i18n.getMessage("patternCountdown_infoUrl"),
            info: brw.i18n.getMessage("patternCountdown_info"),
            languages: [
                "en"
            ]
        },
        {
            /**
             * Scarcity Pattern.
             * The Scarcity Pattern induces (truthfully or falsely) the impression that goods or services are only available in limited numbers.
             * The pattern suggests: Buy quickly, otherwise the beautiful product will be gone!
             * Scarcity Patterns are also used in versions where the alleged scarcity is simply invented or
             * where it is not made clear whether the limited availability relates to the product as a whole or only to the contingent of the portal visited.
             */
            name: brw.i18n.getMessage("patternScarcity_name"),
            className: "scarcity",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the scarcity pattern with English words.
                    // The regular expression checks whether a number is followed by one of several keywords
                    // or alternatively if the word group 'last/final article/item' is present.
                    // The previous state of the element is not used.
                    // Example: "10 pieces available"
                    //          "99% claimed"
                    return /\d+\s*(?:\%|pieces?|pcs\.?|pc\.?|ct\.?|items?)?\s*(?:available|sold|claimed|redeemed|left)|(?:last|final)\s*(?:article|item)/i.test(node.innerText);
                }
            ],
            infoUrl: brw.i18n.getMessage("patternScarcity_infoUrl"),
            info: brw.i18n.getMessage("patternScarcity_info"),
            languages: [
                "en"
            ]
        },
        {
            /**
             * Social Proof Pattern.
             * Social Proof is another Dark Pattern of this category.
             * Positive product reviews or activity reports from other users are displayed directly.
             * Often, these reviews or reports are simply made up.
             * But authentic reviews or reports also influence the purchase decision through smart selection and placement.
             */
            name: brw.i18n.getMessage("patternSocialProof_name"),
            className: "social-proof",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the social proof pattern with English words.
                    // The regular expression checks whether a number is followed by a combination of different keywords.
                    // The previous state of the element is not used.
                    // Example: "5 other customers also bought this article"
                    //          "6 buyers have rated the following products [with 5 stars]"
                    return /\d+\s*(?:other)?\s*(?:customers?|clients?|buyers?|users?|shoppers?|purchasers?|people)\s*(?:have\s+)?\s*(?:(?:also\s*)?(?:bought|purchased|ordered)|(?:rated|reviewed))\s*(?:this|the\s*following)\s*(?:product|article|item)s?/i.test(node.innerText);
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the social proof pattern with English words.
                    // The regular expression checks whether a number is followed by a combination of different keywords.
                    // The previous state of the element is not used.

                    const socialProofRegex = /\d+\s*(?:other)?\s*(?:customers?|clients?|buyers?|users?|shoppers?|purchasers?|people)\s*(?:have\s+)?\s*(?:(?:also\s*)?(?:bought|purchased|ordered)|(?:rated|reviewed))\s*(?:this|the\s*following)\s*(?:product|article|item)s?/i;

                    // Check if the text contains the social proof pattern.
                    return socialProofRegex.test(node.innerText);
                }

            ],
            infoUrl: brw.i18n.getMessage("patternSocialProof_infoUrl"),
            info: brw.i18n.getMessage("patternSocialProof_info"),
            languages: [
                "en",
            ]
        },
        {
            /**
             * Forced Continuity Pattern (adapted to German web pages).
             * The Forced Continuity pattern automatically renews free or low-cost trial subscriptions - but for a fee or at a higher price.
             * The design trick is that the order form visually suggests that there is no charge and conceals the (automatic) follow-up costs.
             */
            name: brw.i18n.getMessage("patternForcedContinuity_name"),
            className: "forced-continuity",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using multiple regular expressions for the forced proof continuity with English words.
                    // The regular expressions check if one of three combinations of a price specification
                    // in euro, Dollar or Pound and the specification of a month is present.
                    // The previous state of the element is not used.
                    if (/(?:(?:€|INR|GBP|£|\₹|INR)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:rupees?|€|INR|GBP|£|pounds?(?:\s*sterling)?|\₹|INR|rupees?))\s*(?:(?:(?:per|\/|a)\s*month)|(?:p|\/)m)\s*(?:after|from\s*(?:month|day)\s*\d+)/i.test(node.innerText)) {
                        // Example: "₹10.99/month after"
                        //          "11 GBP a month from month 4"
                        return true;
                    }
                    if (/(?:(?:€|INR|GBP|£|\₹|INR)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:rupees?|€|INR|GBP|£|pounds?(?:\s*sterling)?|\₹|INR|rupees?))\s*(?:after\s*(?:the)?\s*\d+(?:th|nd|rd|th)?\s*(?:months?|days?)|from\s*(?:month|day)\s*\d+)/i.test(node.innerText)) {
                        // Example: "₹10.99 after 12 months"
                        //          "11 GBP from month 4"
                        return true;
                    }
                    if (/(?:after\s*that|then|afterwards|subsequently)\s*(?:(?:€|INR|GBP|£|\₹|INR)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:rupees?|€|INR|GBP|£|pounds?(?:\s*sterling)?|\₹|INR|rupees?))\s*(?:(?:(?:per|\/|a)\s*month)|(?:p|\/)m)/i.test(node.innerText)) {
                        // Example: "after that ₹23.99 per month"
                        //          "then GBP 10pm"
                        return true;
                    }
                    if (/after\s*(?:the)?\s*\d+(?:th|nd|rd|th)?\s*months?\s*(?:only|just)?\s*(?:(?:€|INR|GBP|£|\₹|INR)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:rupees?|€|INR|GBP|£|pounds?(?:\s*sterling)?|\₹|INR|rupees?))/i.test(node.innerText)) {
                        // Example: "after the 24th months only €23.99"
                        //          "after 6 months ₹10"
                        return true;
                    }
                    if(/agree\s*(?:to)?\s*(?:terms|condition|privacy|policy)?/i.test(node.innerText)){
                        console.log(node.innerText)
                        return true;
                    }
                    if(/(?:subscibe|send)\s*(?:newsletter|update|updates)?/i.test(node.innerText)){
                        console.log(node.innerText)
                        return true;
                    }
                    // Return `false` if no regular expression matches.
                    return false;
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using multiple regular expressions for the forced proof continuity with German words.
                    // The regular expressions check if one of three combinations of a price specification
                    // in INR and the specification of a month is present.
                    // The previous state of the element is not used.
                    if (/\d+(?:,\d{2})?\s*(?:INR|€)\s*(?:(?:pro|im|\/)\s*Monat)?\s*(?:ab\s*(?:dem)?\s*\d+\.\s*Monat|nach\s*\d+\s*(?:Monaten|Tagen)|nach\s*(?:einem|1)\s*Monat)/i.test(node.innerText)) {
                        // Example: "10,99 INR pro Monat ab dem 12. Monat"
                        //          "11€ nach 30 Tagen"
                        return true;
                    }
                    if (/(?:anschließend|danach)\s*\d+(?:,\d{2})?\s*(?:INR|€)\s*(?:pro|im|\/)\s*Monat/i.test(node.innerText)) {
                        // Example: "anschließend 23,99€ pro Monat"
                        //          "danach 10 INR/Monat"
                        return true;
                    }
                    if (/\d+(?:,\d{2})?\s*(?:INR|€)\s*(?:pro|im|\/)\s*Monat\s*(?:anschließend|danach)/i.test(node.innerText)) {
                        // Example: "23,99€ pro Monat anschließend"
                        //          "10 INR/Monat danach"
                        return true;
                    }
                    if (/ab(?:\s*dem)?\s*\d+\.\s*Monat(?:\s*nur)?\s*\d+(?:,\d{2})?\s*(?:INR|€)/i.test(node.innerText)) {
                        // Example: "ab dem 24. Monat nur 23,99 INR"
                        //          "ab 6. Monat 9,99€"
                        return true;
                    }
                    // Return `false` if no regular expression matches.
                    return false;
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using multiple regular expressions for forced proof continuity with English words.
                    // The regular expressions check for combinations of a price specification
                    // in Euro, Dollar, or Pound and the specification of a month.
                    // The previous state of the element is not used.

                    const currencyRegex = /(?:€|\$|£|\₹|INR)/i;
                    const priceRegex = /\d+(?:\.\d{2})?/;
                    const monthRegex = /\d+(?:th|nd|rd|th)?(?:\s*months?|days?)/i;

                    const continuityRegex = new RegExp(
                        `(?:(?:${currencyRegex.source})\\s*${priceRegex.source}|${priceRegex.source}\\s*(?:rupees?|${currencyRegex.source}))\\s*(?:(?:(?:per|\\/|a)\\s*month)|(?:p|\\/)m)\\s*(?:after|from\\s*(?:month|day)\\s*${monthRegex.source})`,
                        'i'
                    );

                    // Check if the text contains the forced continuity pattern.
                    return continuityRegex.test(node.innerText);
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using multiple regular expressions for the forced proof continuity with English words.
                    // The regular expressions check if one of three combinations of a price specification
                    // in euro, Dollar, or Pound and the specification of a month is present.
                    // The previous state of the element is not used.
                    if (/(?:(?:€|\$|£)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|€|£|pounds?(?:\s*sterling)?))\s*(?:(?:(?:per|\/|a)\s*month)|(?:p|\/)m)\s*(?:after|from\s*(?:month|day)\s*\d+)/i.test(node.innerText)) {
                        // Example: "$10.99/month after"
                        //          "£11 a month from month 4"
                        return true;
                    }
                    if (/(?:(?:€|\$|£)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|€|£|pounds?(?:\s*sterling)?))\s*(?:after\s*(?:the)?\s*\d+(?:th|nd|rd|th)?\s*(?:months?|days?)|from\s*(?:month|day)\s*\d+)/i.test(node.innerText)) {
                        // Example: "$10.99 after 12 months"
                        //          "£11 from month 4"
                        return true;
                    }
                    if (/(?:after\s*that|then|afterwards|subsequently)\s*(?:(?:€|\$|£)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|€|£|pounds?(?:\s*sterling)?))\s*(?:(?:(?:per|\/|a)\s*month)|(?:p|\/)m)/i.test(node.innerText)) {
                        // Example: "after that $23.99 per month"
                        //          "then £10pm"
                        return true;
                    }
                    // Return `false` if no regular expression matches.
                    return false;
                }

            ],
            infoUrl: brw.i18n.getMessage("patternForcedContinuity_infoUrl"),
            info: brw.i18n.getMessage("patternForcedContinuity_info"),
            languages: [
                "en"
            ]
        },
        {
            /**
             * Sneaking Pattern.
             * Description of the sneaking pattern.
             * Brief explanation of the sneaking pattern.
             */
            name: brw.i18n.getMessage("patternSneaking_name"),
            className: "sneaking",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using regular expressions for detecting various sneaking patterns.
                    // The previous state of the element is not used.

                    // Check for keywords related to sneaking patterns in English.
                    const sneakingRegex = /(?:hidden|trial period|free trial|auto[-\s]?renew|renewal|recurring|subscription|membership)[\w\s]*(?:fee|charge|cost|price)?/i;


                    // Check if the text contains the sneaking pattern keywords.
                    return sneakingRegex.test(node.innerText);
                },
                function (node, nodeOld) {
                    if (node.type === "checkbox" && node.checked) {
                        // Checkbox is checked
                        console.log(node, "node")
                        return true;
                    }
                    return false;
                }

            ],
            infoUrl: brw.i18n.getMessage("patternSneaking_infoUrl"),
            info: brw.i18n.getMessage("patternSneaking_info"),
            languages: ["en"]
        },

        {
            /**
             * Obstruction Pattern.
             * Description of the obstruction pattern.
             * Brief explanation of the obstruction pattern.
             */
            name: brw.i18n.getMessage("patternObstruction_name"),
            className: "obstruction",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using regular expressions for detecting various obstruction patterns.
                    // The previous state of the element is not used.

                    // Check for keywords related to obstruction patterns in English.
                    const obstructionRegex = /(?:blocked access|restricted access|limited access|access denied|paywall|authorization required|premium content|members only|exclusive content|obstruction|restricted content)[\w\s]*(?:subscribe|payment|membership|access|unlock|fee|charge|cost|price)?/i;

                    // Check if the text contains the obstruction pattern keywords.
                    return obstructionRegex.test(node.innerText);
                }
            ],
            infoUrl: brw.i18n.getMessage("patternObstruction_infoUrl"),
            info: brw.i18n.getMessage("patternObstruction_info"),
            languages: ["en"]
        },
        {
            /**
             * Misdirection Pattern.
             * Description of the misdirection pattern.
             * Brief explanation of the misdirection pattern.
             */
            name: brw.i18n.getMessage("patternMisdirection_name"),
            className: "misdirection",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // indicating a misdirection pattern related to expressing a preference for paying the full amount.
                    // The previous state of the element is not used.

                    // Check if the text contains phrases indicating a preference for paying the full amount.
                    const misdirectionRegex = /\b(?:no|not|don't)\s*(?:want|like|prefer)\s*to\s*pay\s*full\b/i;

                    // Check if the text contains the misdirection pattern keywords.
                    return misdirectionRegex.test(node.innerText);
                },
                function (node, nodeOld) {
                    // Regular expression to match percentages from 50% to 100% off with exactly two digits
                    // const discountRegex = /\b(?:5\d|100)%\s*off\b/i;
                    // const discountRegex = /\b(?:\d{2}|[6-9]\d|\d{3,})%\s*off\b/i;
                    const discountRegex = /\b(?:7[0-9]|[8-9][0-9]|100)%\s*off\b/i;
                    // Check if the text contains the discount pattern
                    return discountRegex.test(node.innerText);
                }
            ],
            infoUrl: brw.i18n.getMessage("patternMisdirection_infoUrl"),
            info: brw.i18n.getMessage("patternMisdirection_info"),
            languages: ["en"]
        },
        {
            name: brw.i18n.getMessage("patternUrgency_name"),
            className: "urgency",
            detectionFunctions: [
                function (node, nodeOld) {
                    const urgencyRegex1 = /\bfree delivery if ordered before\b/i;
                    const urgencyRegex2 = /\bhurry(?:\sup)?\b/i;
                    const urgencyRegex3 = /\bbuy it now\b/i;
                    const urgencyRegex4 = /\blowest price(?: \sin the year)\b/i;
                    const urgencyRegex5 = /\blowest price in [0-9]+ days\b/i;
                    const urgencyRegex6 = /\bget a free gift with your purchase today only\b!|\bpurchase today\b|\bfree gift\b/i;
                    const urgencyRegex7 = /\blimited time offer\b|\bsign up now to receive a special discount\b|\blimited time\b|\blimited time offer\b|\bsign up now\b|\bspecial discount\b/i;

                    return urgencyRegex1.test(node.innerText) ||
                        urgencyRegex2.test(node.innerText) ||
                        urgencyRegex3.test(node.innerText) ||
                        urgencyRegex4.test(node.innerText) ||
                        urgencyRegex5.test(node.innerText) ||
                        urgencyRegex6.test(node.innerText) ||
                        urgencyRegex7.test(node.innerText);
                }
            ],
            infoUrl: brw.i18n.getMessage("patternUrgency_infoUrl"),
            info: brw.i18n.getMessage("patternUrgency_info"),
            languages: ["en"]
        }

    ]
}

/**
 * Checks if the `patternConfig` is valid.
 * @returns {boolean} `true` if the `patternConfig` is valid, `false` otherwise.
 */
function validatePatternConfig() {
    // Create an array with the names of the configured patterns.
    let names = patternConfig.patterns.map(p => p.name);
    // Check if there are duplicate names.
    if ((new Set(names)).size !== names.length) {
        // If there are duplicate names, the configuration is invalid.
        return false;
    }
    // Check every single configured pattern for validity.
    for (let pattern of patternConfig.patterns) {
        // Ensure that the name is a non-empty string.
        if (!pattern.name || typeof pattern.name !== "string") {
            return false;
        }
        // Ensure that the class name is a non-empty string.
        if (!pattern.className || typeof pattern.className !== "string") {
            return false;
        }
        // Ensure that the detection functions are a non-empty array.
        if (!Array.isArray(pattern.detectionFunctions) || pattern.detectionFunctions.length <= 0) {
            return false;
        }
        // Check every single configured detection function for validity.
        for (let detectionFunc of pattern.detectionFunctions) {
            // Ensure that the detection function is a function with two arguments.
            if (typeof detectionFunc !== "function" || detectionFunc.length !== 2) {
                return false;
            }
        }
        // Ensure that the info URL is a non-empty string.
        if (!pattern.infoUrl || typeof pattern.infoUrl !== "string") {
            return false;
        }
        // Ensure that the info/explanation is a non-empty string.
        if (!pattern.info || typeof pattern.info !== "string") {
            return false;
        }
        // Ensure that the languages are a non-empty array.
        if (!Array.isArray(pattern.languages) || pattern.languages.length <= 0) {
            return false;
        }
        // Check every single language for being a non-empty string.
        for (let language of pattern.languages) {
            // Ensure that the language is a non-empty string.
            if (!language || typeof language !== "string") {
                return false;
            }
        }
    }
    // If all checks have been passed successfully, the configuration is valid and `true` is returned.
    return true;
}

/**
 * @type {boolean} `true` if the `patternConfig` is valid, `false` otherwise.
 */
export const patternConfigIsValid = validatePatternConfig();

/**
 * Prefix for all CSS classes that are added to elements on websites by the extension.
 * @constant
 */
export const extensionClassPrefix = "__ph__";

/**
 * The class that is added to elements detected as patterns.
 * Elements with this class get a black border from the CSS styles.
 * @constant
 */
export const patternDetectedClassName = extensionClassPrefix + "pattern-detected";

/**
 * A class for the elements created as shadows for pattern elements
 * for displaying individual elements using the popup.
 */
export const currentPatternClassName = extensionClassPrefix + "current-pattern";

/**
 * A list of HTML tags that should be ignored during pattern detection.
 * The elements with these tags are removed from the DOM copy.
 */
export const tagBlacklist = ["script", "style", "noscript", "audio", "video"];
