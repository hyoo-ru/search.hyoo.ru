/** @jsx $mol_jsx */
namespace $.$$ {
	
	interface GCS {
		execute: ( query: string )=> void
	}
	
	declare namespace google.search.cse.element {
		
		function getElement( gname: string ): GCS
		
		function render( options: {
			div: Element
			tag: 'search'
			gname: string
		} ): void
		
	}
	
	const Results = $mol_data_array( $mol_data_record({
		content: $mol_data_string,
		contentNoFormatting: $mol_data_string,
		richSnippet: $mol_data_record({
			metatags: $mol_data_dict( $mol_data_string ),
		}),
		thumbnailImage: $mol_data_optional(
			$mol_data_record({
				url: $mol_data_string,
				height: $mol_data_string,
				width: $mol_data_string,
			}),
		),
		title: $mol_data_string,
		titleNoFormatting: $mol_data_string,
		url: $mol_data_string,
		visibleUrl: $mol_data_string,
	}) )
	
	export class $hyoo_search extends $.$hyoo_search {
		
		@ $mol_mem
		autofocus() {
			if( this.query() ) return null
			this.Title().focused( true )
			return null
		}
		
		auto() {
			this.autofocus()
		}
		
		@ $mol_mem
		query( next?: string ) {
			const query = this.$.$mol_state_arg.value( 'query', next ) ?? ''
			if( next !== '' ) this.google_api()?.execute( query )
			if( next !== undefined ) this.results_data([])
			return query
		}
		
		title() {
			return [
				... $mol_maybe( this.query() ),
				super.title(),
			].join( ' | ' )
		}
		
		@ $mol_mem
		google_api( next?: GCS ) {
			
			if( next ) return next
			
			window['__gcse'] = {
				
				parsetags: 'explicit',
				
				initializationCallback: ()=> {
					
					google.search.cse.element.render({
						div: <div></div>,
						tag: 'search',
						gname: this.toString(),
					})
					
					this.google_api( google.search.cse.element.getElement( this.toString() ) )
					
				},
				
				searchCallbacks: {
					web: {
						
						starting: ()=> {
						},
						
						ready: (
							gname: string,
							query: string,
							promos: typeof Results.Value,
							results: typeof Results.Value,
							div: Element
						)=> {
							this.results_data( results )
							return true
						},
						
					},
				},
				
			};
			
			const uri = 'https://cse.google.com/cse.js?cx=002821183079327163555:WMX276788641&'
			this.$.$mol_import.script( uri )
			
			return null
		}
		
		@ $mol_mem
		results_data( next?: typeof Results.Value ) {
			return next ?? []
		}
		
		@ $mol_mem
		result_list() {
			return this.results_data()?.map( (_,i)=> this.Result_item(i) ) ?? []
		}
		
		result_image( index: number ) {
			const res = this.results_data()[ index ]
			return res.thumbnailImage?.url ?? this.result_icon( index )
		}
		
		result_icon( index: number ) {
			const res = this.results_data()[ index ]
			return `https://favicon.yandex.net/favicon/${ res.visibleUrl }?color=0,0,0,0&size=32&stub=1`
		}
		
		result_title( index: number ) {
			return this.results_data()[ index ].titleNoFormatting
		}
		
		result_descr( index: number ) {
			return this.results_data()[ index ].contentNoFormatting
		}
		
		@ $mol_mem_key
		result_uri( index: number ) {
			return new URL( this.results_data()[ index ].url ).searchParams.get( 'q' )!
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
