/** @jsx $mol_jsx */
namespace $ {
	
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
		content: $mol_data_optional( $mol_data_string ),
		contentNoFormatting: $mol_data_optional( $mol_data_string ),
		richSnippet: $mol_data_optional(
			$mol_data_record({
				metatags: $mol_data_optional( $mol_data_dict( $mol_data_string ) ),
			})
		),
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
	
	export class $hyoo_search_api extends $mol_object {
		
		@ $mol_mem
		static backend() {
			
			$mol_mem_persist()
			
			let onDone: ( gcs: GCS )=> void
			
			window['__gcse'] = {
				
				parsetags: 'explicit',
				
				initializationCallback: ()=> {
					
					google.search.cse.element.render({
						div: <div></div>,
						tag: 'search',
						gname: this.toString(),
					})
					
					$mol_fiber_defer(()=> {
						onDone( google.search.cse.element.getElement( this.toString() ) )
					})
					
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
							this.future( query ).done( results[0].url ? Results( results ) : [] )
							return true
						},
						
					},
				},
				
			};
			
			const uri = 'https://cse.google.com/cse.js?cx=002821183079327163555:WMX276788641&'
			this.$.$mol_import.script( uri )
			
			return $mol_fiber_sync(
				()=> new Promise< GCS >( done => onDone = done )
			)()
			
		}
		
		@ $mol_mem_key
		static future( query: string ) {
			
			let done!: ( res: typeof Results.Value )=> void
			let fail!: ( err: Error )=> void
			
			const promise = new Promise< typeof Results.Value >( ( d, f )=> {
				done = d
				fail = f
			} )
			
			return { done, fail, promise }
		}
		
		@ $mol_mem_key
		static execute( query: string ): typeof Results.Value {
			
			const backend = this.backend()
			if( !query ) return []
			
			backend.execute( query )
			return $mol_fiber_sync( ()=> this.future( query ).promise )()
			
		}
		
	}
	
}
