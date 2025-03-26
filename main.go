package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	args := os.Args
	var port string

	// read port
	if len(args[1:]) == 1 {
		port = args[1]
	} else if len(args[1:]) == 0 {
		port = "8080"
	} else {
		fmt.Println("Please, enter either one port or none")
		return
	}

	// Create and start server
	serv := NewServer(port)
	err := serv.Start()
	if err != nil {
		log.Fatal("Error: " + err.Error())
		return
	}
}
