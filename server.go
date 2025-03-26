package main

import (
	"fmt"
	"net/http"
)

type Server interface {
	Start() error
	registerRoutes() error
}

type server struct {
	mux  *http.ServeMux
	port string
}

func NewServer(port string) Server {
	return &server{
		mux:  http.NewServeMux(),
		port: ":" + port,
	}
}

func (s *server) Start() error {
	err := s.registerRoutes()
	if err != nil {
		return err
	}

	fmt.Println("Starting server on the port: http://localhost" + s.port)
	// Start server
	return http.ListenAndServe(s.port, s.mux)
}

func (s *server) registerRoutes() error {
	// Routes and endpoints

	fs := http.FileServer(http.Dir("./static"))
	s.mux.Handle("/static/", http.StripPrefix("/static/", fs))

	s.mux.HandleFunc("/", IndexHandler)
	s.mux.HandleFunc("/{id}", DetailsHandler)

	return nil
}
