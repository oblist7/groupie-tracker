package main

type Artist struct {
	ID           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    string   `json:"locations"`
	ConcertDate  string   `json:"concertDates"`
	Realtions    string   `json:"relations"`
	Places       []string
}

type dateLocation struct {
	ID            int                 `json:"id"`
	DateLocations map[string][]string `json:"datesLocations"`
}

type Locations struct {
	Index []Location `json:"index"`
}
type Location struct {
	ID        int      `json:"id"`
	Locations []string `json:"locations"`
	Dates     string   `json:"dates"`
}
