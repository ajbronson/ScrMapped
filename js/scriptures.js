//Force strict compliance mode

let Scriptures = (function () {
    "use strict";

    /*--------------------------------------------------
    CONSTANTS
    *--------------------------------------------------*/

    const ANIMATION_DURATION = 700;
    const SCRIPTURES_URL = "http://scriptures.byu.edu/mapscrip/mapgetscrip.php";


    /*--------------------------------------------------
    PRIVATE VARIABLES
    *--------------------------------------------------*/

    let animatingElements = {};
    let books;
    let requestedBreadcrumbs;
    let requestedNextPrev;
    let volumeArray;
    let map;

    /*--------------------------------------------------
    PRIVATE METHODS
    *--------------------------------------------------*/
    function bookChapterValid (bookID, chapter) {
        let book = books[bookID];
        if (book === undefined || chapter < 0 || chapter > book.numChapters) {
            return false;
        }

        if (chapter === 0 && book.numChapters > 0) {
            return false;
        }

        return true;
    }

    function breadcrumbs (volume, book, chapter) {
        let crumbs;

        if (volume === undefined) {
            crumbs = "<ul><li>The Scriptures</li>";
        } else {
            crumbs = "<ul><li><a href=\"javascript:void(0);\" onclick=\"Scriptures.hash()\">The Scriptures</a></li>";

            if (book === undefined) {
              crumbs += "<li>" + volume.fullName + "</li";
            } else {
              crumbs += "<li><a href=\"javascript:void(0);\" onclick=\"Scriptures.hash(" + volume.id + ")\">" + volume.fullName + "</a></li>";

              if (chapter === undefined || chapter === 0) {
                crumbs += "<li>" + book.tocName + "</li>";
              } else {
                crumbs += "<li><a href=\"javascript:void(0);\" onclick=\"Scriptures.hash(0," + book.id + ")\">" + book.tocName + "</a></li>";
                crumbs += "<li>" + chapter + "</li>";
              }
            }
          }

          return crumbs + "</ul>";
      }

      function cacheBooks () {
        volumeArray.forEach(function (volume) {
          let volumeBooks = [];
          let bookID = volume.minBookId;

          while (bookID <= volume.maxBookId) {
            volumeBooks.push(books[bookID]);
            bookID += 1;
          }

          volume.books = volumeBooks;
        });
      }

      function encodedScriptureUrlParameters (bookID, chapter, verses, isJst) {
        let options = "";

        if (bookID !== undefined && chapter !== undefined) {
          if (verses !== undefined) {
            options += verses;
          }

          if (isJst !== undefined && isJst) {
            options += "&jst=JST";
          }

          return SCRIPTURES_URL + "?book="+
            bookID + "&chap=" + chapter + "&verses=" + options;
        }
    }












    function initializeMap(vetor) {
    if(vetor){
        var myLatlng = new google.maps.LatLng(vetor[3],vetor[2]);
        var mapOptions = {
          zoom: 10,
          mapTypeId: 'terrain',
          center: myLatlng,
          tilt: 45
        }
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var marker = new google.maps.Marker({
            position: myLatlng,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title:vetor[1]
        });

        marker.setMap(map);

        var mapLabel = new MapLabel({
          text: vetor[1], //name of local
          position: new google.maps.LatLng(vetor[3],vetor[2]), //coordinates
          map: map,
          fontSize: 40,
          align: 'right'
        });
        //mapLabel.set('position', new google.maps.LatLng(vetor[3],vetor[2]));

        map.panTo({lat: vetor[3],lng: vetor[2]});
        map.setZoom(Math.round(vetor[8] / 500))

    }


    // eventhandler to when user drags the marker
    (function (marker) {
            google.maps.event.addListener(marker, "dragend", function (e) {
                sugest(marker,vetor);
            });
    })(marker);


}

function SendSugestion(){
    let hashURL = window.location.hash.substr(0).split(':');
    let url =
    "http://scriptures.byu.edu/mapscrip/suggestpm.php?placename="+  $('#placename').val() +
        "&latitude="+ $('#latitude').val() +
        "&longitude="+ $('#longitude').val() +
        "&viewLatitude="+ $('#viewlatitude').val() +
        "&viewLongitude="+ $('#viewlongitude').val() +
        "&viewTilt="+ $('#viewtilt').val() +
        "&viewRoll="+ $('#viewroll').val() +
        "&viewAltitude="+ $('#viewaltitude').val() +
        "&viewHeading="+ $('#viewheading').val() +
        "&offset="+ $('#offset').val().replace(/['"]+/g, '') +
        "&chapter="+ hashURL[hashURL.length-1] +
        "&bookId="+ hashURL[hashURL.length-2] ;
        console.log($('#offset').val().replace(/['"]+/g, ''));
        $.ajax(url, {
              success: function(data) {
                 alert('Suggestion saved successfully');
              },
              error: function() {
                 alert('Opz! Something went wrong');
              }
        });



}


function sugest(marker,vetor){
    let url =
    "http://scriptures.byu.edu/mapscrip/suggestpm.php?id="+ vetor[0] +
        "&placename="+ vetor[1].replace(/['"]+/g, '') +
        "&latitude="+ marker.getPosition().lat() +
        "&longitude="+ marker.getPosition().lng() +
        "&viewLatitude="+ vetor[4] +
        "&viewLongitude="+ vetor[5] +
        "&viewTilt="+ vetor[6] +
        "&viewRoll="+ vetor[7] +
        "&viewAltitude="+ vetor[8] +
        "&viewHeading="+ vetor[9] ;

    if (confirm('Would you like to suggest this new zoom?')){
        $.ajax(url, {
          success: function(data) {
             alert('Suggestion saved successfully');
          },
          error: function() {
             alert('Opz! Something went wrong');
          }
        });
    }






}

function showLocation (a, b, d, c, e, g, h, l, k) {
    let vetor = [];
    vetor.push(a);
    vetor.push(b);
    vetor.push(c);
    vetor.push(d);
    vetor.push(e);
    vetor.push(g);
    vetor.push(h);
    vetor.push(l);
    vetor.push(k);
    initializeMap(vetor)

}



function loadMarkers(){
    let coordinates;
    //Default location is Jerusalem
    var defaultLocation = new google.maps.LatLng(31.7683, 35.2137);
    var configureMap = {
      center: defaultLocation,
      tilt: 50,
      zoom: 5,
      mapTypeId: 'terrain',
    }

    if (map === undefined || map == null)
    {
      //create new map object
      
      map = new google.maps.Map(document.getElementById("map"), configureMap);
    }
    let marker;
    var bounds = new google.maps.LatLngBounds();
    let listVerses = $('a[onclick^="showLocation("]');


    map.addListener('bounds_changed', function() {
        window.currentZoom = map.getZoom();
        window.currentLat = map.getCenter().lat();
        window.currentLng = map.getCenter().lng();

    });


    // Center to Jerusalem if no coordinates
    if(listVerses.length<1){
        return
    }

    for (var i=0;i<listVerses.length;i++){ // grabes the ULs
        coordinates = (listVerses[i].getAttribute("onclick")).split(',');


        marker = new google.maps.Marker({
            position: new google.maps.LatLng(coordinates[2],coordinates[3]),
            title:coordinates[1].replace(/['"]+/g, ''),
            animation: google.maps.Animation.DROP,
            map: map
        });

        var mapLabel = new MapLabel({
          text: coordinates[1].replace(/['"]+/g, ''), //name of local
          position: new google.maps.LatLng(coordinates[2],coordinates[3]), //coordinates
          map: map,
          fontSize: 20,
          align: 'right'
        });

        bounds.extend(marker.getPosition());
    }


    //center the map to the geometric center of all markers
    map.fitBounds(bounds);
    map.setZoom(map.getZoom()-1);

    // set a minimum zoom
    // if you got only 1 marker or all markers are on the same address map will be zoomed too much.
    if(map.getZoom()> 10){
        map.setZoom(10);
    }



}










    function transitionCrossfade(newContent, property, parentSelector, childSelector){
         if (animatingElements.hasOwnProperty(property+"In") || animatingElements.hasOwnProperty(property+"Out")) {
             window.setTimeout(transitionCrossfade, 200, newContent);
             return;
         }

         let content = $(parentSelector+ " " +childSelector);

         newContent = $(newContent);

         if (content.length>0) {
             animatingElements[property+"Out"]=content;
             content.animate({
                 opacity:0
             }, {
                 queue: false,
                 duration: ANIMATION_DURATION,
                 complete: function(){
                     content.remove();
                     delete animatingElements[property+"Out"];
                 }
             });

             animatingElements[property+"In"]=newContent;
             newContent.css({opacity:0}).appendTo(parentSelector);
             newContent.animate({
                opacity:1
             }, {
                 queue: false,
                 duration: ANIMATION_DURATION,
                 complete: function(){
                     delete animatingElements[property+"In"];
                     loadMarkers();
                 }
             });
         } else {
             $(parentSelector).html(newContent);
         }
      }

      function transitionBreadcrumbs (newCrumbs){
          transitionCrossfade(newCrumbs, "crumbs", "#crumb","ul");

      }

      function transitionScriptures(newContent){
          transitionCrossfade(newContent, "scriptures", "#scriptures", "*");

      }

      function getScriptureCallback (html){
          html = $(html);
          html.find(".navheading").append("<div class=\"nextprev\">" + requestedNextPrev+"</div>");
          transitionScriptures(html);
          transitionBreadcrumbs(requestedBreadcrumbs);
      }

      function getScriptureFailed (){
          console.log("The AJAX, failed!");
      };

    function prevChapter(bookID, chapter) {
          let book = books[bookID];

          if (book !== undefined) {
            if (chapter >  1) {
              return [bookID, chapter - 1,titleForBookChapter(book, chapter-1)];
            }

            let prevBook = books[bookID - 1];

            if (prevBook !== undefined) {
              return [prevBook.id, prevBook.numChapters,titleForBookChapter(prevBook, prevBook.numChapters)];
            }
          }
    }

    function titleForBookChapter(book, chapter){
        return book.tocName + (chapter > 0 ? " " + chapter : "");
    }


     function  nextChapter(bookID, chapter) {
          let book = books[bookID];

          if (book !== undefined) {
            if (chapter < book.numChapters) {
              return [bookID, chapter + 1, titleForBookChapter(book, chapter+1)];
            }

            let nextBook = books[bookID + 1];

            if (nextBook !== undefined) {
              let nextChapter = 0;

              if (nextBook.numChapters > 0) {
                nextChapter = 1;
              }

              return [nextBook.id, nextChapter,titleForBookChapter(nextBook, nextChapterValue)];
          }
        }
      }

      function navigateBook (bookID) {
          let book = books[bookID];
          let volume = volumeArray[book.parentBookId -1];
          let chapter = 1;
          let navContents;

          if (book.numChapters<=0){
              navigateChapter(book.id,0);

          } else if(book.numChapters===1){
              navigateChapter(book.id,1);
          } else{
              navContents = "<div id=\"scripnav\"><div class=\"volume\">     <h5>"+book.fullName+"<h5></div><div class=\"books\">";
              while(chapter<= book.numChapters){
                  navContents+= "<a class=\"waves-effect waves-ripple btn chapter\" id=\""+
                      chapter + "\" href=\"#0:"+ book.id+":"+chapter+"\">"+chapter + "</a>";
                  chapter+=1;
              }
              navContents += "</div>";
              transitionScriptures(navContents);
              transitionBreadcrumbs(breadcrumbs(volume, book));
          }
      }

      function navigateChapter (bookID, chapter) {

        if(bookID!== undefined){
            let book = books[bookID];
            let volume = volumeArray[book.parentBookId -1];

            requestedBreadcrumbs = breadcrumbs(volume, book, chapter);

            let nextPrev = prevChapter(bookID,chapter);

            if(nextPrev===undefined){
                requestedNextPrev = "";
            }else{
                requestedNextPrev = "<a href=\"javascript:void(0);\" onclick=\"Scriptures.hash(0, "+nextPrev[0]+", "+nextPrev[1]+")\" title=\""+nextPrev[2]+"\"><i class=\"material-icons\">skip_previous</i></a>";
            }


            nextPrev = nextChapter(bookID,chapter);

            if(nextPrev!==undefined){
                requestedNextPrev +="<a href=\"javascript:void(0);\" onclick=\"Scriptures.hash(0, "+nextPrev[0]+", "+nextPrev[1]+")\" title=\""+nextPrev[2]+"\"><i class=\"material-icons\">skip_next</i></a>";
            }



            $.ajax({
               "url": encodedScriptureUrlParameters(bookID, chapter),
                "success": getScriptureCallback,
                "error": getScriptureFailed

            });
        }
      }

      function navigateHome (volumeID) {
        let displayVolume;
        let navContents = "<div id=\"scripnav\">";
        Scriptures.volumes().forEach(function (volume) {
            if (volumeID === undefined || volume.id === volumeID) {
              navContents += "<div class=\"volume\"><a name=\"v"+volume.id+ "\"  /><h5>" +volume.fullName +
                  "</h5></div><div class=\"books\">";

                volume.books.forEach(function (book) {
                  navContents += "<a class=\"waves-effect waves-ripple btn\" id=\""+
                      book.id + "\" href=\"#" + volume.id + ":" + book.id+"\">"+book.gridName + "</a>";
                });

                navContents += "</div>";

                if(volume.id === volumeID){
                    displayVolume = volume;
                }
            }
          });

          navContents +="<br></br></div>"

          transitionScriptures(navContents);
          transitionBreadcrumbs(breadcrumbs(displayVolume));
      }



      /*--------------------------------------------------
      PUBLIC API
      *--------------------------------------------------*/

      const publicInterface = {
        bookByID(bookID) {
          return books[bookID];
        },

        hash(volumeID, bookID, chapter) {
          let newHash = "";

          if (volumeID !== undefined) {
            newHash += volumeID;

            if (bookID !== undefined) {
              newHash += ":" + bookID

              if (chapter !== undefined) {
                newHash += ":" + chapter
              }
            }
          }

          window.location.hash = newHash;
        },

        init(callback) {

          let booksLoaded = false;
          let volumesLoaded = false;

          $.ajax({
            "url" : "http://scriptures.byu.edu/mapscrip/model/books.php",
            "dataType" : "json",
            "success" : function (data) {
              books = data;
              booksLoaded = true;

              if (volumesLoaded) {
                cacheBooks();

                if (typeof callback == "function") {
                  callback();
                }
              }
            }
          });

          $.ajax({
            "url" : "http://scriptures.byu.edu/mapscrip/model/volumes.php",
            "dataType" : "json",
            "success" : function (data) {
              volumeArray = data;
              volumesLoaded = true;

              if (booksLoaded) {
                cacheBooks();

                if (typeof callback == "function") {
                  callback();
                }
              }
            }
          });
        },

        onHashChanged() {

          let bookID;
          let chapter;
          let ids = [];
          let volumeID;

          if (window.location.hash !== "" && window.location.hash.length > 1) {
            ids = window.location.hash.substring(1).split(":");
          }

          if (ids.length <= 0) {
            navigateHome();
          } else if (ids.length === 1) {
            volumeID = Number(ids[0]);

            if (volumeID < volumeArray[0].id || volumeID > volumeArray[volumeArray.length - 1]) {
              navigateHome();
            } else {
              navigateHome(volumeID);
            }
          } else if (ids.length === 2) {
            bookID = Number(ids[1]);

            if (books[bookID] === undefined) {
              navigateHome();
            }

            navigateBook(bookID);
          } else {
            bookID = Number(ids[1]);
            chapter = Number(ids[2]);

            if (!bookChapterValid(bookID, chapter)) {
              navigateHome();
            }

            navigateChapter(bookID, chapter);
          }
        },


        urlForScriptureChapter(bookID, chapter, verses, isJst) {
          let book = books[bookID];

          if (book !== undefined) {
            if ((chapter === 0 && book.numChapters === 0) ||
              (chapter > 0 && chapter <= book.numChapters)) {
                return encodedScriptureUrlParameters(bookID, chapter, verses, isJst);
              }
          }
        },

        volumes() {
          return volumeArray.slice();
        }
      };

      return publicInterface;

    }());
