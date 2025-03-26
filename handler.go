package main

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"strings"
)

type ErrorPage struct {
	StatusCode int
	Message    string
}

var templates = template.Must(template.ParseGlob(`./templates/*.html`))

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" || r.URL.Path != "/" {
		RenderError(w, http.StatusNotFound, "Page not found")
		return
	}

	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/artists")
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "'https://groupietrackers.herokuapp.com' is not responding")
		log.Println("Error fetching:", err)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "Internal Server Error")
		log.Println("Error fetching:", err)
		return
	}

	var artists []Artist
	_ = json.Unmarshal(body, &artists)

	resp, err = http.Get("https://groupietrackers.herokuapp.com/api/locations")
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "'https://groupietrackers.herokuapp.com' is not responding")
		log.Println("Error fetching:", err)
		return
	}

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "Internal Server Error")
		log.Println("Error fetching:", err)
		return
	}

	var locations Locations
	_ = json.Unmarshal(body, &locations)

	for i := range artists {
		artists[i].Places = locations.Index[i].Locations
	}

	err = templates.ExecuteTemplate(w, "index.html", artists)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func DetailsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		RenderError(w, http.StatusNotFound, "Page not found")
		return
	}

	var id string
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) == 2 {
		id = pathParts[1]
	} else {
		RenderError(w, http.StatusNotFound, "Page not found")
		return
	}

	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/artists/" + id)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "'https://groupietrackers.herokuapp.com' is not responding")
		log.Println("Error fetching:", err)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "Internal Server Error")
		log.Println("Error fetching:", err)
		return
	}

	var artist Artist
	_ = json.Unmarshal(body, &artist)

	if artist.ID == 0 {
		RenderError(w, http.StatusNotFound, "Page not found")
		return
	}

	resp, err = http.Get("https://groupietrackers.herokuapp.com/api/relation/" + id)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "'https://groupietrackers.herokuapp.com' is not responding")
		log.Println("Error fetching:", err)
		return
	}

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, "Internal Server Error")
		log.Println("Error fetching:", err)
		return
	}

	var dates dateLocation
	_ = json.Unmarshal(body, &dates)

	data := map[string]interface{}{
		"artist": artist,
		"dates":  dates,
	}

	err = templates.ExecuteTemplate(w, "details.html", data)
	if err != nil {
		RenderError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func RenderError(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)

	errorPage := ErrorPage{
		StatusCode: statusCode,
		Message:    message,
	}

	err := templates.ExecuteTemplate(w, "error.html", errorPage)

	if err != nil {
		log.Println("Error rendering error page:", err)
		http.Error(w, errorPage.Message, http.StatusInternalServerError)
		return
	}
}

// TODO: Write other handlers
