package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const template = "# %s\n"

func (a *App) OpenMarkdown(nodeName string) {
	filepath := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", nodeName))

	isNewFile := true
	file, err := os.OpenFile(filepath, os.O_CREATE|os.O_EXCL, 0666)
	if err != nil {
		if errors.Is(err, os.ErrExist) {
			file, err = os.OpenFile(filepath, os.O_RDONLY|os.O_APPEND, 0666)
			if err != nil {
				panic(err)
			}
			isNewFile = false
		} else {
			panic(err)
		}
	}
	defer file.Close()

	content := ""
	if isNewFile {
		content = fmt.Sprintf(template, nodeName)
		_, err := file.WriteString(content)
		if err != nil {
			panic(err)
		}
	} else {
		var builder strings.Builder
		buf := make([]byte, 4096)
		for {
			n, err := file.Read(buf)
			if n > 0 {
				builder.Write(buf[:n])
			}
			if err == io.EOF {
				break
			}
			if err != nil {
				panic(err)
			}
		}
		content = builder.String()
	}
	runtime.EventsEmit(a.ctx, "content", content)
}

func (a *App) RenameNodeLabel(oldLabel string, newLabel string) {
	old := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", oldLabel))
	new := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", newLabel))

	err := os.Rename(old, new)
	if err != nil {
		fmt.Printf("Failed to rename file from %s to %s: %v\n", old, new, err)
		return
	}
	fmt.Printf("Renamed file from %s to %s\n", old, new)
}

func (a *App) RemoveNodeLabel(label string) {
	filepath := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", label))

	err := os.Remove(filepath)
	if err != nil {
		fmt.Printf("Failed to remove file %s: %v\n", filepath, err)
		return
	}
	fmt.Printf("Removed file %s\n", filepath)
}
