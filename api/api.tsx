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
			attributes?: object
		} ): void
		
	}
	
	const Image = $mol_data_record({
		url: $mol_data_string,
		height: $mol_data_string,
		width: $mol_data_string,
	})
	
	const Results = $mol_data_array( $mol_data_record({
		content: $mol_data_optional( $mol_data_string ),
		contentNoFormatting: $mol_data_optional( $mol_data_string ),
		richSnippet: $mol_data_optional(
			$mol_data_record({
				metatags: $mol_data_optional( $mol_data_dict( $mol_data_string ) ),
			})
		),
		thumbnailImage: $mol_data_optional( Image ),
		image: $mol_data_optional( Image ),
		title: $mol_data_string,
		titleNoFormatting: $mol_data_string,
		url: $mol_data_optional( $mol_data_string ),
		contextUrl: $mol_data_optional( $mol_data_string ),
		visibleUrl: $mol_data_string,
	}) )
	
	export class $hyoo_search_api extends $mol_object2 {
		
		@ $mol_mem_key
		static type( type: 'web' | 'image' ) {
			const api = new this
			api.type = $mol_const( type )
			return api
		}
		
		type() {
			return 'web' as 'web' | 'image'
		}
		
		@ $mol_mem
		static backend() {
			
			$mol_mem_persist()
			
			let done: ( gcs: typeof google.search.cse.element )=> void
			const promise = $mol_fiber.run(
				()=> new Promise< typeof google.search.cse.element >( d => done = d )
			)
			
			const ready = ( type: 'web' | 'image' ) => (
				gname: string,
				query: string,
				promos: typeof Results.Value,
				results: typeof Results.Value,
				div: Element
			)=> {
				
				if( results.length && !Object.keys( results[0] ).length ) results = []
				
				const future = $hyoo_search_api.type( type ).future( query )
				
				try {
					future.done( Results( results ) )
				} catch( error ) {
					future.fail( error )
				}
				
				return true
			}
			
			window['__gcse'] = $mol_fiber.run( ()=> ({
				
				parsetags: 'explicit',
				
				initializationCallback: ()=> {
					
					const api = google.search.cse.element
					
					done( api )
					
				},
				
				searchCallbacks: {
					web: { ready: ready( 'web' ) },
					image: { ready: ready( 'image' ) },
				},
				
			}) )
			
			const uri = 'https://cse.google.com/cse.js?cx=002821183079327163555:WMX276788641&'
			this.$.$mol_import.script( uri )
			
			return $mol_fiber_sync( ()=> promise )()
			
		}
		
		@ $mol_mem
		backend() {
			
			const backend = $hyoo_search_api.backend()
			const gname = this.toString()
					
			backend.render({
				div: <div></div>,
				tag: 'search',
				gname,
				attributes: {
					defaultToImageSearch: this.type() === 'image',
				},
			})
			
			return backend.getElement( gname )
		}
		
		@ $mol_mem_key
		future( query: string ) {
			
			let done!: ( res: typeof Results.Value )=> void
			let fail!: ( err: Error )=> void
			
			const promise = new Promise< typeof Results.Value >( ( d, f )=> {
				done = d
				fail = f
			} )
			
			return { done, fail, promise }
		}
		
		@ $mol_mem_key
		execute( query: string ): typeof Results.Value {
			
			const backend = this.backend()
			if( !query ) return []
			
			backend.execute( query )
 
			const future = this.future( query )
			return $mol_fiber_sync( ()=> future.promise )()
			
		}
		
	}
	
}
