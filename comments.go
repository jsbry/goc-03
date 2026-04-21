package main

import (
	"fmt"

	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SaveComments(jsonData string) {
	fmt.Println("SaveComments called", jsonData)
	err := saveJsonFileContent(commentsFile, jsonData)
	if err != nil {
		fmt.Println("Error saving comments:", err)
		return
	}
	rt.EventsEmit(a.ctx, "comments", jsonData)
}
