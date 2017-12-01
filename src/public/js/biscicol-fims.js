/* ====== General Utility Functions ======= */
var appRoot = "/";
var biocodeFimsRestRoot = "/biocode-fims/rest/v2/";

$.ajaxSetup({
    headers: {'Fims-App': 'Biscicol-Fims'},
    beforeSend: function (jqxhr, config) {
        jqxhr.config = config;
        var biscicolSessionStorage = JSON.parse(window.sessionStorage.biscicol);
        var accessToken = biscicolSessionStorage.accessToken;
        if (accessToken && config.url.indexOf("access_token") == -1) {
            if (config.url.indexOf('?') > -1) {
                config.url += "&access_token=" + accessToken;
            } else {
                config.url += "?access_token=" + accessToken;
            }
        }
    }
});

$.ajaxPrefilter(function (opts, originalOpts, jqXHR) {
    // you could pass this option in on a "retry" so that it doesn't
    // get all recursive on you.
    if (opts.refreshRequest) {
        return;
    }

    if (opts.url.indexOf('/validate') > -1) {
        return;
    }

    if (typeof(originalOpts) != "object") {
        originalOpts = opts;
    }

    // our own deferred object to handle done/fail callbacks
    var dfd = $.Deferred();

    // if the request works, return normally
    jqXHR.done(dfd.resolve);

    // if the request fails, do something else
    // yet still resolve
    jqXHR.fail(function () {
        var args = Array.prototype.slice.call(arguments);
        var biscicolSessionStorage = JSON.parse(window.sessionStorage.biscicol);
        var refreshToken = biscicolSessionStorage.refreshToken;
        if ((jqXHR.status === 401 || (jqXHR.status === 400 && jqXHR.responseJSON.usrMessage == "invalid_grant"))
            && !isTokenExpired() && refreshToken) {
            $.ajax({
                url: biocodeFimsRestRoot + 'authenticationService/oauth/refresh',
                method: 'POST',
                refreshRequest: true,
                data: $.param({
                    client_id: client_id,
                    refresh_token: refreshToken
                }),
                error: function () {
                    window.sessionStorage.biscicol = JSON.stringify({});

                    // reject with the original 401 data
                    dfd.rejectWith(jqXHR, args);

                    if (!window.location.pathname == appRoot)
                        window.location = appRoot + "login";
                },
                success: function (data) {
                    var biscicolSessionStorage = {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        oAuthTimestamp: new Date().getTime()
                    };

                    window.sessionStorage.biscicol = JSON.stringify(biscicolSessionStorage);

                    // retry with a copied originalOpts with refreshRequest.
                    var newOpts = $.extend({}, originalOpts, {
                        refreshRequest: true,
                        url: originalOpts.url.replace(/access_token=.{20}/, "access_token=" + data.access_token)
                    });
                    // pass this one on to our deferred pass or fail.
                    $.ajax(newOpts).then(dfd.resolve, dfd.reject);
                }
            });

        } else {
            dfd.rejectWith(jqXHR, args);
        }
    });

    // NOW override the jqXHR's promise functions with our deferred
    return dfd.promise(jqXHR);
});

function isTokenExpired() {
    var biscicolSessionStorage = JSON.parse(window.sessionStorage.biscicol);
    var oAuthTimestamp = biscicolSessionStorage.oAuthTimestamp;
    var now = new Date().getTime();

    if (now - oAuthTimestamp > 1000 * 60 * 60 * 4)
        return true;

    return false;
}


function failError(jqxhr) {
    var buttons = {
        "OK": function () {
            $("#dialogContainer").removeClass("error");
            $(this).dialog("close");
        }
    }
    $("#dialogContainer").addClass("error");

    var message;
    if (jqxhr.responseJSON) {
        message = jqxhr.responseJSON.usrMessage;
    } else {
        message = "Server Error!";
    }
    dialog(message, "Error", buttons);
}

// function to open a new or update an already open jquery ui dialog box
function dialog(msg, title, buttons) {
    var dialogContainer = $("#dialogContainer");
    if (dialogContainer.html() != msg) {
        dialogContainer.html(msg);
    }

    if (!$(".ui-dialog").is(":visible") || (dialogContainer.dialog("option", "title") != title ||
        dialogContainer.dialog("option", "buttons") != buttons)) {
        dialogContainer.dialog({
            modal: true,
            autoOpen: true,
            title: title,
            resizable: false,
            width: 'auto',
            draggable: false,
            buttons: buttons,
            position: {my: "center top", at: "top", of: window}
        });
    }

    return;
}

/* ====== bcidCreator.jsp Functions ======= */

/** Process submit button for Data Group Creator **/
function bcidCreatorSubmit() {
    /* Send the data using post */
    var posting = $.post(biocodeFimsRestRoot + "bcids", $("#bcidForm").serialize())
        .done(function (data) {
            var b = {
                "Ok": function () {
                    $('#bcidForm')[0].reset();
                    $(this).dialog("close");
                }
            }
            var msg = "Successfully created the bcid with identifier: " + data.identifier;
            dialog(msg, "Success creating bcid!", b);
        }).fail(function (jqxhr) {
            failError(jqxhr);
        });
}
