package main

import (
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SaveComments(jsonData string) {
	fmt.Println("SaveComments called", jsonData)
	err := saveJsonFileContent(commentsFile, jsonData)
	if err != nil {
		fmt.Println("Error saving comments:", err)
		return
	}
	runtime.EventsEmit(a.ctx, "comments", jsonData)
}
