define(
  'ephox.alloy.api.GuiTemplate',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse',
    'ephox.violin.Strings',
    'global!Error'
  ],

  function (Objects, Arr, Obj, Merger, Json, Fun, Result, Element, Node, Text, Traverse, Strings, Error) {
    var failure = function (message, spec) {
      throw new Error(message +'\n' + Json.stringify(spec, null, 2));
    };

    var safeMassage = function (spec) {
      if (spec.dom !== undefined && spec.template !== undefined) return Result.error('Cannot specify both config DOM and template DOM');
      else if (spec.template === undefined) return Result.value(spec); // Let the eror get handled by boulder which is more graceful with error messages
      else return readTemplate(spec.template).fold(function (err) {
        return Result.error(err);
      }, function (addSpec) {
        var newSpec = Merger.deepMerge(spec, addSpec);
        console.log('newSpec', newSpec);
        if (newSpec.components.length > 0 && spec.components !== undefined && spec.components.length > 0) return Result.error('Cannot specify a template with a child element AND components');
        else return Result.value(newSpec);
      });
    };

    var massage = function (spec) {
      return safeMassage(spec).fold(function (err) {
        failure(err, spec);
      }, Fun.identity);
    };

    var getAttrs = function (elem) {
      var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [ ];
      return Arr.foldl(attributes, function (b, attr) {
        return Merger.deepMerge(b, Objects.wrap(attr.name, attr.value));
      }, {});
    };

    var readTemplate = function (template) {
      var regex = /\${([^{}]*)}/g;
      var fields = template.html.match(regex);

      var fs = Arr.map(fields, function (f) {
        return f.substring('${'.length, f.length - '}'.length);
      });

      var missing = Arr.filter(fs, function (field) {
        return !Objects.hasKey(template.replacements, field);
      });

      if (missing.length > 0) return Result.error('Missing fields in HTML template replacement\nMissing: [' + missing.join(', ') + '].\nProvided: [' + Obj.keys(template.replacements).join(', ') + ']');
      else {
        var html = Strings.supplant(template.html, template.replacements);
        return readHtml(html);
      }
    };

    var readHtml = function (html) {
      var elem = Element.fromHtml(html);
      return Node.isText(elem) ? Result.error('Template text must contain an element!') : Result.value(
        read(elem)
      );
    };


    var read = function (elem) {
      var attrs = getAttrs(elem);
      var children = Traverse.children(elem);

      var components = Arr.map(children, function (child) {
        if (Node.isText(child)) return { text: Text.get(child) };
        else {
          var parsed = read(child);
          return { 
            uiType: 'custom',
            dom: parsed.dom,
            components: parsed.components
          };
        }
      });

      return {
        dom: {
          tag: Node.name(elem),
          attributes: attrs
        },
        components: components
      };
    };

    return {
      massage: massage
    };
  }
);