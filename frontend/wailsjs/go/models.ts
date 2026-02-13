export namespace main {
	
	export class AppConstants {
	    PageName: string;
	    IsViewComment: boolean;
	    Workspace: string;
	    Nodes: string;
	    Edges: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConstants(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.PageName = source["PageName"];
	        this.IsViewComment = source["IsViewComment"];
	        this.Workspace = source["Workspace"];
	        this.Nodes = source["Nodes"];
	        this.Edges = source["Edges"];
	    }
	}

}

