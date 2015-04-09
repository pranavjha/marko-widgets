/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
function RegisterWidetNode(props) {
    RegisterWidetNode.$super.call(this);
    if (props) {
        this.setProperties(props);
    }
}
RegisterWidetNode.prototype = {
    doGenerateCode: function (template) {
        var widgetTypes = template.data.widgetTypes;

        if (!widgetTypes || widgetTypes.length === 0) {
            return;
        }

        // We add a function to the top of the template that can be used
        // to lazily register the widget by associating a widget type name
        // with a loaded widget module. We do the registering of the widget
        // lazily in case there is a circular dependency between
        // the compiled template module, the renderer.js and the widget.js
        template.addStaticCode(function(writer) {
            /*
            Produce code similar to the following:
              function registerWidget() {
                if (typeof window != "undefined") {
                  __markoWidgets.__registerWidget(__widgetPath, require("./"));
                }
              }

              NOTE: This function is called in the code generated by
                    the compile-time "register-widget-node.js" node.
                    That node is added by inserting a  <w-register-widget>
                    node into the AST below.
            */
            writer.line('function __registerWidget() {');
            writer.incIndent();
            writer.line('if (typeof window != "undefined") {');
            writer.incIndent();
            widgetTypes.forEach(function(registeredType) {
                writer.line('__markoWidgets.registerWidget(' + registeredType.name + ', ' + registeredType.target + ');');
            });

            writer.decIndent();
            writer.line('}');
            writer.decIndent();
            writer.line('}');
        });

        template.line('if (__registerWidget) {');
        template.incIndent();
        template.line('__registerWidget();');
        template.line('__registerWidget = null;');
        template.decIndent();
        template.line('}');
        template.line('');
    }
};

module.exports = RegisterWidetNode;