/* Application JavaScript */
'use strict';

var saveName = null;
var dirty = false;


function SetHeaderText(txt) {
    if (txt.length > 0) {
        txt = "UI Demo: " + txt;
    } else {
        txt = "UI Demo"
    }
    
    $("#app-title").text(txt);
}


function GetHeaderText() {
    var txt = $("#app-title").text();
    var sep = ': '
    var sepIx = txt.indexOf(sep);
    
    if (sepIx === -1) {
        txt = "";
    } else {
        txt = txt.slice(sepIx + sep.length);
    }
    
    return txt;
}


function SetDirty() {
    if ( !dirty ) {
        dirty = true;
        SetHeaderText(GetHeaderText() + "*");
    }
}


function ClearDirty() {
    if (dirty) {
        dirty = false;
        SetHeaderText(GetHeaderText().replace('*', ''));
    }
}


$(document).ready(function() {
    // Enable tooltips
    $(document).tooltip({tootipClass: "ui-tooltip"});
    
    // Enable menu
    $("#menu").menu();
    
    // Set draggable
    $(".ui-tool-block__tool").draggable({
        helper: "clone",
        addClasses: false,
        revert: "invalid",
        opacity: 0.7
    });
    
    $("#content-block").droppable({
        tolerance: "fit",
        accept: ".ui-tool-block__tool, .ui-content-block__tool",
        drop: function(event, ui) {
            var myItem = null;
            
            SetDirty();
            
            if (ui.draggable.hasClass("ui-tool-block__tool")) {
                myItem = ui.helper.clone();
                myItem.switchClass("ui-tool-block__tool", "ui-content-block__tool");
                myItem.css("opacity", 1.0);
                $(this).append(myItem);
                myItem.draggable({
                    containment: "parent",
                    helper: "original",
                    opacity: 1.0
                });
            }
        }
    });
    
    var confirmDialog, saveDialog, form;
    var saveFormName = $("#save-form__name");
    var saveFormTips = $("#save-form__tips");
    var defaultTip = "A project name is required.";
    var quitAction = undefined;
    
    function UpdateTips(tipTxt) {
        saveFormTips.text(tipTxt).addClass("ui-state-highlight");
        setTimeout(function () {
            saveFormTips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }
    
    function SaveProject() {
        ClearDirty();
        saveName = saveFormName.val();
        SetHeaderText(saveFormName.val());
    }
    
    function ValidLength(options) {
        var fieldLen = options.field.val() ? options.field.val().length : 0;
        var valid = ((fieldLen <= options.max) && (fieldLen >= options.min));
        
        if (!valid) {
            options.field.addClass("ui-state-error");
            UpdateTips("Field " + options.fieldName + " value must be between " + options.min + " and " + options.max + " inclusive.");
        }
        
        return valid;
    }
    
    function ValidRegex(options) {
        var fieldVal = options.field.val() || " ";
        var valid = options.regex.test(fieldVal);
        
        if (!valid) {
            options.field.addClass("ui-state-error");
            UpdateTips(options.errMsg);
        }
        
        return valid;
    }
    
    function ValidateSaveForm() {
        var valid = true;
        var vFuncs = [
            {
                func: ValidLength,
                options: {
                    field: null,
                    fieldName: null,
                    min: 1,
                    max: 50
                }
            },
            {
                func: ValidRegex, 
                options: {
                    field: null, 
                    fieldName: null,
                    regex: /^\w[\w \-\.]*\w$/,
                    errMsg: "{NAME} value must not start or end with a space, dot, or dash. Alphanumeric characters, spaces, dots, dashes and underscores are allowed otherwise."
                }
            }
        ];
        
        for (let i = 0; i < vFuncs.length && valid; i++) {
            var opts = vFuncs[i].options;
            opts.field = saveFormName;
            opts.fieldName = saveFormName.attr("prettyname") || saveFormName.attr("name") || saveFormName.attr("tag");
            if (opts.errMsg) {
                opts.errMsg = opts.errMsg.replace("{NAME}", opts.fieldName);
            }
            valid = vFuncs[i].func(opts);
        }
        
        return valid;
    };
    
    function DoSave() {
        var valid = ValidateSaveForm();
        
        if (valid) {
            SaveProject();
            saveDialog.dialog("close");
        }
        
        return valid;
    };
    
    saveDialog = $("#save-form-block").dialog({
        autoOpen: false,
        height: 275,
        width: 310,
        modal: true,
        closeText: "Cancel",
        buttons: [
            {
                text: "Save",
                click: DoSave
            },
            {
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }
        ],
        close: function() {
            form[0].reset();
            saveFormName.removeClass("ui-state-error");
            saveFormTips.text(defaultTip);
            if (quitAction) {
                quitAction();
            }
        }
    });
    
    form = saveDialog.find("#save-form");
    
    form.on("submit", function(event) {
        event.preventDefault();
        return DoSave();
    });
    
    function HandleSave() {
        if (dirty) {
            if (saveName === null) {
                saveDialog.dialog("open");
            } else {
                ClearDirty();
            }
        }
    };
    
    $("#menu__item-save").on("click", function(event) {
        HandleSave();
    });
    
    confirmDialog = $("#quit-confirm-block").dialog({
        autoOpen: false,
        modal: true,
        height: 300,
        width: 350,
        closeText: "Pffft!",
        buttons: [
            {
                text: "I'll be good",
                click: function() {
                    confirmDialog.dialog("close");
                    quitAction = function() {
                        alert("Project has been saved.");
                        window.location = "https://www.google.com/";
                    }
                    HandleSave();
                }
            },
            {
                text: "Pffft!",
                click: function() {
                    confirmDialog.dialog("close");
                    window.location = "https://www.google.com/";
                }
            }
        ]
    });
    
    $("#menu__item-quit").on("click", function(event) {
        if (dirty) {
            confirmDialog.dialog("open");
        } else {
            window.location = "https://www.google.com/";
        }
    });
    
    // Disable div text selection
    $("div").disableSelection();
});
