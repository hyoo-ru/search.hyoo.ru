namespace $.$$ {
	
	export class $hyoo_search_app extends $.$hyoo_search_app {
		
		@ $mol_mem
		autofocus() {
			if( this.query() ) return null
			this.Query().focused( true )
			return null
		}
		
		auto() {
			this.autofocus()
		}
		
		@ $mol_mem
		query( next?: string ) {
			return this.$.$mol_state_arg.value( 'query', next ) ?? ''
		}
		
		query_google( query: string ) {
			query = query.trim()
			if( !query ) return ''
			return `( "${ query }" OR (${ query }) ) ${ this.query_forbidden() }`
		}
		
		@ $mol_mem
		query_dump() {
			return ( this.query_google( this.query() ) )
				.split( /\s+/g )
				.filter( a => a.trim() )
				.join( '\n' )
		}
		
		blacklist( next?: string ) {
			return this.$.$mol_state_local.value( 'blacklist', next ) ?? super.blacklist()
		}
		
		@ $mol_mem
		settings( next?: boolean ) {
			const str = next == undefined ? undefined : String( next )
			return this.$.$mol_state_arg.value( 'settings', str ) !== null
		}

		@ $mol_mem
		pages() {
			return [
				this.Main(),
				... this.settings() ? [ this.Settings() ] : [],
			]
		}
		
		title() {
			return `${ super.title() } | Search.HyOO.ru`
		}
		
		@ $mol_mem
		results_raw() {
			return this.$.$hyoo_search_api.execute( this.query_google( this.query() ) )
		}
		
		@ $mol_mem
		query_forbidden() {
			return this.blacklist()
				.split( $mol_regexp.line_end )
				.map( domain => domain.trim() )
				.filter( Boolean )
				.map( domain => '-site:' + domain )
				.join( ' ' )
		}
		
		@ $mol_mem
		result_list() {
			return this.results_raw().map( (_,i)=> this.Result_item(i) )
		}
		
		result_image( index: number ) {
			const res = this.results_raw()[ index ]
			return res.thumbnailImage?.url ?? this.result_icon( index )
		}
		
		result_icon( index: number ) {
			const res = this.results_raw()[ index ]
			return `https://favicon.yandex.net/favicon/${ res.visibleUrl }?color=0,0,0,0&size=32&stub=1`
		}
		
		result_title( index: number ) {
			return this.results_raw()[ index ].titleNoFormatting
		}
		
		result_descr( index: number ) {
			return this.results_raw()[ index ].contentNoFormatting ?? ''
		}
		
		result_host( index: number ) {
			return this.results_raw()[ index ].visibleUrl ?? ''
		}
		
		@ $mol_mem_key
		result_uri( index: number ) {
			return new URL( this.results_raw()[ index ].url ).searchParams.get( 'q' )!
		}
		
		@ $mol_mem_key
		result_uri_view( index: number ) {
			const uri = this.result_uri( index )
			try {
				return decodeURI( uri )
			} catch( error ) {
				return uri
			}
		}
		
		@ $mol_mem
		searcher_list() {
			const query = this.query()
			if( query ) {
				return Object.keys( this.searcher_data() ).map( id => this.Searcher_link( id ) )
			} else {
				return [ this.Powered() ]
			}
		}
		
		@ $mol_mem_key
		searcher_link( id: string ) {
			return this.searcher_data()[ id ] + encodeURIComponent( this.query() )
		}
		
		@ $mol_mem_key
		searcher_hint( id: string ) {
			return id
		}
		
	}
	
}
