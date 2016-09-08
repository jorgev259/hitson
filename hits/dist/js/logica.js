﻿//variables globales
var canciones;
var cancionesU;
var datosCanciones = [];
var numPlay;
var reproductor;
var contA = -1;
var playlists;
var divPlay = "";
var divInicio = "";
var listaRandom = [];

function mensaje(text1, text2) {
    document.getElementById("carga").style.display = "block";
    document.getElementById("transparencia").style.display = "block";
    $("#carga2").append("<div id='base'>" + text1 + "</div>");
    $("#carga2").append("<div id='play'>" + text2 + "</div>");
}

function quitarMensaje() {
    $("#play").remove();
    $("#base").remove();
    document.getElementById("carga").style.display = "none";
    document.getElementById("transparencia").style.display = "none";
}

function lista() {
    mensaje("Preparando Canciones", "Preparando Playlists");

    if (divPlay == "") {
        divPlay = $("#sidebarPlaylist").clone();
    }

    if (divInicio == "") {
        divInicio = $("#inicio").clone();
    }

    var data = new FormData();
    data.append('op', 'busqueda');

    var data2 = new FormData();
    data2.append('op', 'busqueda2');

    $.ajax({
        url: '/Api/cancion',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {

        if(result != ""){
            canciones = result.split(">");

            for (i = 0; i < canciones.length; i++) {
                canciones[i] = JSON.parse(canciones[i]);
            }

            var listaUpdate = [];
            canciones.forEach(function (c) {
                listaUpdate.push(c.cancion);
            });

            datosCancion(listaUpdate);

            $.ajax({
                url: '/Api/cancion',
                processData: false,
                contentType: false,
                data: data2,
                type: 'POST'
            }).done(function (result) {
                if(result != ""){
                    cancionesU = result.split(">");
                    for (i = 0; i < cancionesU.length; i++) {
                        cancionesU[i] = JSON.parse(cancionesU[i]);
                    }

                    $("#base").remove();

                    document.getElementById("carga").style.display = "none";
                    document.getElementById("transparencia").style.display = "none";
                }
            }).fail(function (a, b, c) {
                console.log(a, b, c);
            });
        }
    }).fail(function (a, b, c) {
        console.log(a, b, c);
    });

    $.ajax({
        url: '/Api/playlist',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        if(result != ""){
            playlists = result.split(">");
            console.log(playlists);
            for (i = 0; i < playlists.length; i++) {
                playlists[i] = JSON.parse(playlists[i]);
            }

            $("#play").remove();

            $("#sidebarPlaylist").replaceWith(divPlay.clone());

            playlists.forEach(function (play) {
                if (pedirCampo("num_usuario") == play.usuario) {
                    $("#sidebarPlaylist").append("<li ><a><i class='fa fa-link'></i><span>" + play.nombre + "</span><i class='fa fa-fw fa-play' onclick='cargarPlaylist(" + play.numero + ")'></i></a></li>");
                }
            });
        }

        var playlistUsuario = new FormData();
        playlistUsuario.append("op", "busquedaUsuario");
        playlistUsuario.append("id_usuario", pedirCampo("num_usuario"));

        $.ajax({
            url: '/Api/playlist',
            processData: false,
            contentType: false,
            data: playlistUsuario,
            type: 'POST'
        }).done(function (result) {
            if (result != "") {
                var list = result.split(">");
                console.log(list);
                for (i = 0; i < list.length; i++) {
                    list[i] = JSON.parse(list[i]);
                }

                console.log(list);

                list.forEach(function (play) {
                    if (pedirCampo("num_usuario") == play.usuario) {
                        $("#sidebarPlaylist").append("<li ><a><i class='fa fa-link'></i><span>" + playlists[play.playlist].nombre + "</span><i class='fa fa-fw fa-play' onclick='cargarPlaylist(" + playlists[play.playlist].numero + ")'></i></a></li>");
                    }
                });
            }
        }).fail(function (a, b, c) {
            console.log(a, b, c);
        });
    }).fail(function (a, b, c) {
        console.log(a, b, c);
    });

}

function inicio() {
    $("#inicio").replaceWith(divInicio.clone());
}

function mostrarCancion(id) {
    if (document.getElementById(id).style.display == "none" || document.getElementById(id).style.display == "") {
        document.getElementById(id).style.display = "block";
        document.getElementById("transparencia").style.display = "block";
    } else {
        document.getElementById(id).style.display = "none";
        document.getElementById("transparencia").style.display = "none";

        if (id == "gamer") {
            document.getElementById("generoCancion").value = "";
            document.getElementById("nombreCancion").value = "";
            document.getElementById("artistaCancion").value = "";
            document.getElementById("albumCancion").value = "";
            document.getElementById("comentarioCancion").value = "";
        }
    }
}

function subirCancion() {
    var data = new FormData();
    var Files = $("#archivoCancion").get(0).files;
    var nombre = document.getElementById('nombreCancion').value;
    var genero = document.getElementById('generoCancion').value;
    var album = document.getElementById('albumCancion').value;
    var artista = document.getElementById('artistaCancion').value;
    var com = document.getElementById('comentarioCancion').value;
    var user = pedirCampo("num_usuario");

    data.append('Files', Files[0]);
    data.append('nombre', nombre);
    data.append('genero', genero);
    data.append('artista', artista);
    data.append('album', album);
    data.append('com', com);
    data.append('usuario', user);
    data.append('op', 'agregar');

    mensaje("Subiendo Cancion", "");

    $.ajax({
        url: '/Api/cancion',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        quitarMensaje();
        alert(result);
        mostrarCancion("gamer");
        lista();
    }).fail(function (a, b, c) {
        console.log(a, b, c);
        mostrarCancion("gamer");
    });
}

function datosCancion(listaId) {
    datosCanciones.forEach(function (cancion) {
        listaId.forEach(function (item) {
            if (cancion["filename"] == item) {
                var index = listaId.indexOf(cancion["filename"]);
                listaId.splice(index, 1);
            }
        });
    });
    
    if (listaId != "") {
        var listaEnviar = JSON.stringify(listaId);
        var data = new FormData;

        data.append("lista", listaEnviar);
        data.append("op", "datos");

        $.ajax({
            url: '/Api/cancion',
            processData: false,
            contentType: false,
            data: data,
            type: 'POST'
        }).done(function (result) {
            var lista = result.split(">");

            for (i = 0; i < lista.length; i++) {
                lista[i] = JSON.parse(lista[i]);
            }

            lista.forEach(function (item) {
                var numero = item["filename"]
                datosCanciones[numero] = item;
            })
        }).fail(function (a, b, c) {
            console.log(a, b, c);
        });
    } 
}

function subirAlbum() {
    var archivos = $("#archivoAlbum").get(0).files;
    var data = new FormData;
    var lista = [];
    var num = 0;
    var user = pedirCampo("num_usuario");
    data.append("op", "album");

    for (i = 0; i < archivos.length; i++) {

        data.append("Files" + i, archivos[i]);

        jsmediatags.read(archivos[i], {
            onSuccess: function (tag) {
                var dato = {};

                if(tag.tags.title == undefined || tag.tags.title == ""){
                    dato["nombre"] = archivos[i].name;
                }else{
                    dato["nombre"] = tag.tags.title;
                }

                dato["genero"] = tag.tags.genre;
                dato["artista"] = tag.tags.artist;
                dato["album"] = $("#nombreAlbum").val();
                dato["com"] = tag.tags.comment;
                dato["usuario"] = user;

                $.each(dato, function (key, value) {
                    if (value == "" || value == undefined) {
                        dato[key] = "Desconocido";
                    }
                });

                lista.push(JSON.stringify(dato));

                if (num == archivos.length - 1) {
                    data.append("datos", JSON.stringify(lista));
                    $.ajax({
                        url: '/Api/cancion',
                        processData: false,
                        contentType: false,
                        data: data,
                        type: 'POST'
                    }).done(function (result) {
                        alert(result);
                        mostrarCancion("subirAlbum");
                        lista();
                    }).fail(function (a, b, c) {
                        console.log(a, b, c);
                        mostrarCancion("SubirAlbum");
                    });
                }

                num++;
            },
            onError: function (error) {
                console.log(error);
            }
        });      
    };    
}

function subirPlaylist() {
    var data = new FormData();
    var nombre = document.getElementById('nombrePlaylist').value;
    var com = document.getElementById('comentarioPlaylist').value;
    var user = pedirCampo("num_usuario");

    data.append('nombre', nombre);
    data.append('com', com);
    data.append('usuario', user);
    data.append('op', 'agregar');

    mensaje("Agregando Playlist","");

    $.ajax({
        url: '/Api/playlist',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false
    }).done(function (result) {
        alert(result);
        mostrarCancion('crearPlaylist');
        quitarMensaje();
        lista();
    }).fail(function (a, b, c) {
        console.log(a, b, c);
    });
}

function reproducir(id) {
    var iframe = document.getElementById('reproductor');
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    innerDoc.getElementById("audio-player").src = "temp/" + id + ".mp3";
    innerDoc.getElementById("etiqueta").innerHTML = datosCanciones[id]["artista"] + " - " + datosCanciones[id]["nombre"];
}

function busqueda() {
    var cajaBusqueda = document.getElementById("busquedaMusica").value.toLowerCase();
    var listaBusqueda = [];
    var num = 0;
    var num2 = 0;
    var existe;
    var nombre = "";
    var genero = "";
    var artista = "";
    var album = "";
    var id;
    $("#inicio").html("");

    mensaje("Realizando Busqueda");

    canciones.forEach(function (s) {
        existe = false;
        num2 = 0;
        listaBusqueda.forEach(function (s) {
            if (s.filename === listaBusqueda[num2]) {
                existe = true;
            }
            num2++;
        })
        
        nombre = datosCanciones[s.cancion]["nombre"].toLowerCase().indexOf(cajaBusqueda);
        genero = datosCanciones[s.cancion]["genero"].toLowerCase().indexOf(cajaBusqueda);
        artista = datosCanciones[s.cancion]["artista"].toLowerCase().indexOf(cajaBusqueda);
        album = datosCanciones[s.cancion]["album"].toLowerCase().indexOf(cajaBusqueda);

        if (existe == false && (nombre !== -1 || genero !== -1 || artista !== -1 || album !== -1)) {
            listaBusqueda[num] = s;
            num++;
            console.log(listaBusqueda[num]);
        }
    })

    var listaPlaylist = [];

    playlists.forEach(function(s) {
        num = 0;
        if (s["nombre"].indexOf(cajaBusqueda) !== -1) {
        //if (nombre !== -1) {
            listaPlaylist[num] = s;
            num++;
        }
    })


    $("#inicio").html("");

    listaBusqueda.forEach(function (cancion) {       
        $("#inicio").append(" <div class='row' id='" + datosCanciones[cancion.cancion]["nombre"] + "'><div class='col-xs-12'><div class='box'><div class='box-body table-responsive no-padding'><table class='table table-hove'><tr><th>Canción</th><th>Artista</th><th>Album</th><th>Género</th></tr><tr><td>" + datosCanciones[cancion.cancion]["nombre"] + "</td><td>" + datosCanciones[cancion.cancion]["artista"] + "</td><td>" + datosCanciones[cancion.cancion]["album"] + "</td><td>" + datosCanciones[cancion.cancion]["genero"] + "</td></tr><tr><button id='boton' class='btn btn-flat btn-success' onclick='uniraPlaylist(" + cancion.cancion + ")'>Agregar a la Playlist</button><button id='boton' class='btn btn-flat btn-success' onclick='agregarMiMusica(" + cancion.cancion + ")'>Agregar a mi musica</button></tr></table></div></div></div></div>");
    })

    console.log(listaPlaylist);
    console.log(playlists);

    var Id_usuario = pedirCampo("num_usuario");
    listaPlaylist.forEach(function (playlist) {
        $("#inicio").append(" <div class='row' id='" + playlists[playlist.numero]["numero"] + "'><div class='col-xs-12'><div class='box'><div class='box-body table-responsive no-padding'><table class='table table-hove'><tr><th>Playlist</th><th>Creador</th><th>Comentario</th></tr><tr><td>" + playlists[playlist.numero]["nombre"] + "</td><td>" + playlists[playlist.numero]["usuario"] + "</td><td>" + playlists[playlist.numero]["comentario"] + "</td></tr><tr><button id='boton' class='btn btn-flat btn-success' onclick='unirPlaylist(" + playlists[playlist.numero]["numero"] + "," + Id_usuario + ")'>Agregar a mis Playlists</button></tr></table></div></div></div></div>");
    })

    quitarMensaje();

    //Codigo para mostrar playlists de la busqueda
}

function pedirImagen(id, src) {
    document.getElementById(src).src = "temp/" + id + ".png";
}

function logout() {

    sessionStorage.clear();
    alert("Adiooos :3");
    document.location.href = "login.html";

}

function verificar() {
    if (sessionStorage == null || sessionStorage == "" || sessionStorage.length == 0) {
        document.location.href = "login.html";
    }
}

function miMusica(modo) {
    listaRandom = [];

    if (modo == "normal") {
        if ($("#random").length) {
            $("#random").prop("id", modo);
        }
    } else {
        if ($("#normal").length) {
            $("#normal").prop("id", "random");
        }
    }
    
    var id = pedirCampo("num_usuario");

    contA = -1;
    var cont = 0;
    reproductor = [];
    if(canciones != undefined){
        canciones.forEach(function (c) {
            if (c.user == id) {
                reproductor[cont] = c.cancion;
                cont++;
        }
        })
    }

    cont = 0;

    if(cancionesU != undefined){
        cancionesU.forEach(function (cU) {
            if (cU.usuario == id) {
                reproductor[cont] = cU.cancion;
                cont++;
            }
        })
    }

    contA = -1;

    nextC(modo);

    var iframe = document.getElementById('reproductor');
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    innerDoc.getElementById("audio-player").addEventListener("ended", nextC, false)


    alert("Canciones del usuario cargadas al reproductor");
}

function mostrarMiMusica() {
    $("#inicio").html("");

    var id = pedirCampo("num_usuario");
    var lista = []

    if (canciones != undefined) {
        canciones.forEach(function (c) {
            if (c.user == id) {
                lista.push(c.cancion);
            }
        })
    }

    if (cancionesU != undefined) {
        cancionesU.forEach(function (cU) {
            if (cU.usuario == id) {
                lista.push(cU.cancion);
            }
        })
    }

    lista.forEach(function (cancion) {
        $("#inicio").append(" <div class='row' id='" + datosCanciones[cancion]["nombre"] + "'><div class='col-xs-12'><div class='box'><div class='box-body table-responsive no-padding'><table class='table table-hove'><tr><th>Canción</th><th>Artista</th><th>Album</th><th>Género</th></tr><tr><td>" + datosCanciones[cancion]["nombre"] + "</td><td>" + datosCanciones[cancion]["artista"] + "</td><td>" + datosCanciones[cancion]["album"] + "</td><td>" + datosCanciones[cancion]["genero"] + "</td></tr></table></div></div></div></div>");
    })
}

function nextC(id) {
    if(id=="normal"){
        contA++;
        if (contA == reproductor.length) {
            contA = 0;
            alert("la lista se reinicio porque llego a su final");
        };
        reproducir(reproductor[contA]);
    } else if (id == "random") {
        if (listaRandom.length == reproductor.length) {
            listaRandom = [];
        }

        var numero = 99;
        var max = reproductor.length - 1;
        var min = 0;
        var reproducida = false;
        
        do {
            numero = Math.floor(Math.random() * (max - min + 1) + min);
            reproducida = false;
            listaRandom.forEach(function (numero2) {
                if (numero == numero2) {
                    reproducida = true;
                }
            });
        } while (reproducida == true);

        listaRandom.push(numero);
        reproducir(reproductor[numero]);
    }
}

function asignarImagen(id) {
    var objeto = JSON.parse(sessionStorage.datosUsuario);
    pedirImagen(objeto.num_usuario,id);
}

function pedirCampo(campo) {
    var dato = JSON.parse(sessionStorage.datosUsuario)[campo];
    return dato;
}

function agregarMiMusica(objeto) {
    var data = new FormData();
    data.append('cancion', objeto);
    data.append('id', pedirCampo("num_usuario"));
    data.append('op', 'agregarMiMusica');

    $.ajax({
        url: '/Api/cancion',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST',
    }).done(function (result) {
        alert(result);
        lista();
    }).fail(function (a, b, c) {
        console.log(a, b, c);
    });
}






function uniraPlaylist2(id_cancion,id_playlist) {
    var data = new FormData();
    data.append("op", "unir");
    data.append("id_cancion", id_cancion);
    data.append("id_playlist", id_playlist);

    $.ajax({
        url: '/Api/playlist',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        alert(result);
        mostrarCancion("listaMusica");
    });
}

function unirPlaylist(id_playlist, id_usuario) {
    var data = new FormData();
    data.append("op", "unirAUsuario");
    data.append("id_playlist", id_playlist);
    data.append("id_usuario", id_usuario);

    $.ajax({
        url: '/Api/playlist',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
       
    }).done(function (result) {
        alert(result);
        lista();
    });
}


function cargarPlaylist(id_playlist) {
    var data = new FormData();
    data.append("op", "reproducir");
    data.append("id_playlist", id_playlist);

    $.ajax({
        url: '/Api/playlist',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        if (result == "") {
            alert("Playlist vacia");
        }else{
            var lista = result.split(">");
            var cancionesP = [];
            reproductor = [];

            for (i = 0; i < lista.length; i++) {
                cancionesP[i] = JSON.parse(lista[i]);
                reproductor[i] = cancionesP[i].cancion;
            }

            contA = -1;
            nextC();
        
            alert("playlists cargada al reproductor");
        }
    });
}

$(document).ready(function () {
    var campo = pedirCampo('nickname');
    document.getElementById("nick1").innerHTML = campo;
    document.getElementById("nick2").innerHTML = campo;
    document.getElementById("user1").innerHTML = pedirCampo('usuario');
    var inputTypeFile = document.getElementById("archivoCancion");

    inputTypeFile.addEventListener("change", function (event) {
        var file = event.target.files[0];

        jsmediatags.read(file, {
            onSuccess: function (tag) {
                document.getElementById("generoCancion").value = tag.tags.genre;
                document.getElementById("nombreCancion").value = tag.tags.title;
                document.getElementById("artistaCancion").value = tag.tags.artist;
                document.getElementById("albumCancion").value = tag.tags.album;
                document.getElementById("comentarioCancion").value = tag.tags.comment;
            },
            onError: function (error) {
                console.log(error);
            }
        });
    }, false);
    lista();
});