package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"path"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) OpenWorkspace(dirPath string) {
	dir := filepath.Base(dirPath)
	workspace = dir
	runtime.EventsEmit(a.ctx, "workspace", workspace)

	a.publicAssets()

	nodes := getJsonFileContent("nodes.json")
	runtime.EventsEmit(a.ctx, "nodes", nodes)

	edges := getJsonFileContent("edges.json")
	runtime.EventsEmit(a.ctx, "edges", edges)
}

func (a *App) publicAssets() error {
	if a.server != nil {
		a.server.Shutdown(context.Background())
	}

	info, err := os.Stat(workspace)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("workspace directory does not exist: %s", workspace)
		}
		return fmt.Errorf("error accessing workspace directory: %w", err)
	}
	if !info.IsDir() {
		return fmt.Errorf("workspace is not a directory: %s", workspace)
	}

	filesDir := filepath.Join(workspace, "assets")

	info, err = os.Stat(filesDir)
	if err != nil {
		if os.IsNotExist(err) {
			err = os.Mkdir(filesDir, 0755)
			if err != nil {
				return fmt.Errorf("failed to create assets directory: %w", err)
			}
			info, err = os.Stat(filesDir)
		}
	}
	if !info.IsDir() {
		return fmt.Errorf("assets path is not a directory: %s", filesDir)
	}

	mux := http.NewServeMux()
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(filesDir))))

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return err
	}
	runtime.EventsEmit(a.ctx, "baseURL", fmt.Sprintf("http://%s/", listener.Addr().String()))

	a.server = &http.Server{
		Handler: mux,
	}

	go func() {
		a.server.Serve(listener)
	}()

	return nil
}

func (a *App) SaveToAssets(src string) (string, error) {
	filename := filepath.Base(src)
	dest := filepath.Join(workspace, "assets", filename)

	input, err := os.ReadFile(src)
	if err != nil {
		return "", fmt.Errorf("failed to read source file: %w", err)
	}

	err = os.WriteFile(dest, input, 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write file to assets: %w", err)
	}

	uri := path.Join("assets", filename)

	return uri, nil
}
