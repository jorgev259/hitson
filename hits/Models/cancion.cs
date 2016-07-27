﻿using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Helpers;
using System.Web.Script.Serialization;

namespace hits.Models
{
    public class cancion
    {
        private int num_cancion ;
        private string nombre ;
        private string genero ;
        private string artista ;
        private string album ;
        private string comentario ;
        private int rating ;

        cancion(){}

        public int _num_cancion {  get {return num_cancion;} set {num_cancion=value;} }
        public string _nombre {  get {return nombre;} set {nombre=value;} }
        public string _genero {  get {return genero;} set {genero=value;} }
        public string _artista {  get {return artista;} set {artista=value;} }
        public string _album {  get {return album;} set {album=value;} }
        public string _comentario {  get {return comentario;} set {comentario=value;} }
        public int _rating {  get {return rating;} set {rating=value;} }

        public static String insertarCancion(int num_cancion, string nombre, string genero, string artista, string album, string comentario, MongoClient client, IMongoDatabase db, IMongoCollection<BsonDocument> collection, GridFSBucket bucket) {

            //var server = MongoServer.Create("mongodb://localhost:27017");

            var numero = collection.Count(new BsonDocument());

            byte[] file = File.ReadAllBytes(AppDomain.CurrentDomain.BaseDirectory + "temp\\" + num_cancion + ".mp3");
            var id = bucket.UploadFromBytes(num_cancion.ToString(), file);

            var filter = Builders<BsonDocument>.Filter.Eq("filename", num_cancion.ToString());
            var update = Builders<BsonDocument>.Update.Set("nombre", nombre).Set("genero", genero).Set("artista", artista).Set("album", album).Set("comentario", comentario).Set("rating", 0);

            var update2 = collection.UpdateOne(filter, update);

            File.Delete(AppDomain.CurrentDomain.BaseDirectory + "temp\\" + num_cancion + ".mp3");


            return "Subida Completada";
        }

        public static String reproducir(int id, MongoClient client, IMongoDatabase db, IMongoCollection<BsonDocument> collection, GridFSBucket bucket)
        {
            var array = bucket.DownloadAsBytesByName(id.ToString());
            String cancion = "data:audio/mp3;base64," + Convert.ToBase64String(array);

            var filter = Builders<BsonDocument>.Filter.Eq("filename", id.ToString());
            var documento = collection.Find(filter).ToList()[0].ToBsonDocument();
            documento.Remove("_id");
            documento.Remove("length");
            documento.Remove("uploadDate");
            documento.Add("cancion", cancion);

            var final = documento.ToJson();

            return final;
        }

        public static List<String> listaCanciones(IMongoCollection<BsonDocument> coleccion)
        {
            BsonDocument place = new BsonDocument();
            var filtro = new BsonDocument();
            var lista = coleccion.Find(filtro).ToList();
            var algo = lista.Count();

            List<String> canciones = new List<String>();

            for(int i = 0; i < lista.Count();)
            {
                lista[i].Remove("_id");
                lista[i].Remove("length");
                lista[i].Remove("uploadDate");
                canciones.Add(lista[i].ToJson());
            }
              
            return canciones;
        }
    }
}