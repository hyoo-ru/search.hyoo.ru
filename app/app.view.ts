namespace $.$$ {
	
	export class $hyoo_search_app extends $.$hyoo_search_app {
		
		@ $mol_memo.field
		get $() {
			const Base = super.$.$mol_state_arg
			return super.$.$mol_ambient({
				$mol_state_arg: class extends Base {
					static separator = ';'
					static href = Base.href.bind( Base )
				}
			})
		}
		
		@ $mol_mem
		autofocus() {
			if( this.query() ) return null
			
			$mol_fiber_defer( ()=> {
				this.Query().Query().focused( true )
			} )
			
			return null
		}
		
		auto() {
			this.autofocus()
		}
		
		@ $mol_mem
		query( next?: string ) {
			return this.$.$mol_state_arg.value( 'query', next ) ?? ''
		}
		
		@ $mol_mem
		query_backend() {
			
			const query = this.query().trim()
			if( !query ) return ''
			
			return `${ query } ${ this.query_forbidden() }`
		}
		
		@ $mol_mem
		query_dump() {
			return this.query_backend()
				.split( /\s+/g )
				.filter( a => a.trim() )
				.join( '\n' )
		}
		
		blacklist( next?: string ) {
			return this.$.$mol_state_local.value( 'blacklist', next ) ?? super.blacklist()
		}
		
		searchers( next?: string ) {
			return this.$.$mol_state_local.value( 'searchers', next ) ?? super.searchers()
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
		main_content() {
			if( !this.query() ) return []
			return super.main_content()
		}
		
		@ $mol_mem
		results_raw() {
			return this.$.$hyoo_search_api.execute( this.query_backend() )
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
		
		@ $mol_mem
		result_ban_options( index: number ) {
			const names = this.result_host( index ).split('.')
			return names.slice( 0, -1 ).map( ( _, i )=> names.slice(i).join('.') )
		}
		
		result_ban( index: number, host?: string ) {
			if( host ) this.blacklist( this.blacklist() + '\n' + host )
			return ''
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
			return this.searchers().split( '\n' ).filter( Boolean ).map( uri => uri.trim() )
		}
		
		@ $mol_mem
		searcher_links() {
			return this.searcher_list().map( (_,i) => this.Searcher_link( i ) )
		}
		
		@ $mol_mem_key
		searcher_link( index: number ) {
			return this.searcher_list()[ index ] + encodeURIComponent( this.query() )
		}
		
	}
	
}
