/*
 * All Endpoints need to have at least the following:
 * annotationsList - current list of OA Annotations
 * dfd - Deferred Object
 * init()
 * search(options, successCallback, errorCallback)
 * create(oaAnnotation, successCallback, errorCallback)
 * update(oaAnnotation, successCallback, errorCallback)
 * deleteAnnotation(annotationID, successCallback, errorCallback) (delete is a reserved word)
 * TODO:
 * read() //not currently used
 *
 * Optional, if endpoint is not OA compliant:
 * getAnnotationInOA(endpointAnnotation)
 * getAnnotationInEndpoint(oaAnnotation)
 */
(function($){

  $.AlexandriaEndpoint = function(options) {

    jQuery.extend(this, {
      url:		         options.url,
      authkey:         options.authkey,
      dfd:             null, // a Deferred object that is resolved when searches are complete
      annotationsList: [],        //OA list for Mirador use
      windowID:        null,
      eventEmitter:    null
    }, options);

    this.init();
  };

  $.AlexandriaEndpoint.prototype = {
    init: function() {
      //whatever initialization your endpoint needs
    },

    //Search endpoint for all annotations with a given URI in options
    search: function(options, successCallback, errorCallback) {
      var _this = this;

      //use options.uri
      jQuery.ajax({
        url: _this.url + "/search",
        type: 'GET',
        dataType: 'json',
        headers: { },
        data: { },
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          //check if a function has been passed in, otherwise, treat it as a normal search
          if (typeof successCallback === "function") {
            successCallback(data);
          } else {
            _this.annotationsList = data; // gmr
            jQuery.each(_this.annotationsList, function(index, value) {
              value.endpoint = _this;
            });
            _this.dfd.resolve(false);          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },

    //Delete an annotation by endpoint identifier
    deleteAnnotation: function(annotationID, successCallback, errorCallback) {
      var _this = this;
      jQuery.ajax({
        url: _this.url,
        type: 'DELETE',
        headers: authHeaders(),
        success: function(data) {
          if (typeof successCallback === "function") {
            successCallback();
          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },

    //Update an annotation given the OA version
    update: function(oaAnnotation, successCallback, errorCallback) {
      var annotation = oaAnnotation,
      _this = this;

      jQuery.ajax({
        url: _this.url,
        type: 'PUT',
        dataType: 'json',
        headers: authHeaders(),
        data: JSON.stringify(oaAnnotation),
        contentType: "application/ld+json;profile=\"http://iiif.io/api/presentation/2/context.json\"",
        success: function(data) {
          if (typeof successCallback === "function") {
            successCallback();
          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },

    //takes OA Annotation, gets Endpoint Annotation, and saves
    //if successful, MUST return the OA rendering of the annotation
    create: function(oaAnnotation, successCallback, errorCallback) {
      var _this = this;

      jQuery.ajax({
        url: _this.url,
        type: 'POST',
        dataType: 'json',
        headers: _this.authHeaders(),
        data: JSON.stringify(oaAnnotation),
        contentType: "application/ld+json;profile=\"http://iiif.io/api/presentation/2/context.json\"",
        success: function(data) {
          if (typeof successCallback === "function") {
            data.endpoint = _this;
            successCallback(data);
          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },

    userAuthorize: function(action, annotation) {
      return true;  // qallow all
    },

    set: function(prop, value, options) {
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
    },

    authHeaders: function() {
      return { "auth": "SimpleAuth " + this.authkey };
    }
  };

}(Mirador));
