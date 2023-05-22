/** @jsx $mol_jsx */
namespace $ {
	
	export interface $hyoo_search_api_external {
		execute: ( query: string )=> void
	}
	
	declare namespace google.search.cse.element {
		
		function getElement( gname: string ): $hyoo_search_api_external
		
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
			$mol_wire_solid()
			const api = new this
			api.type = $mol_const( type )
			return api
		}
		
		type() {
			return 'web' as 'web' | 'image'
		}
		
		@ $mol_memo.method
		static async backend() {
			
			let done: ( gcs: typeof google.search.cse.element )=> void
			const promise = new Promise< typeof google.search.cse.element >( d => done = d )
			
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
					future.promise.done( Results( results ) )
				} catch( error: any ) {
					future.promise.fail( error )
				}
				
				return true
			}
			
			;( window as any )['__gcse'] = {
				
				parsetags: 'explicit',
				
				initializationCallback: ()=> {
					
					google.search.cse = new Proxy( google.search.cse, {
						get: ( sce: any, field )=> {
							if( /^api/.test( String( field ) ) && typeof sce[ field ] === 'function' ) {
								return function( ... args: any[] ) {
									const error = args[0].error
									if( error ) {
										setTimeout( ()=> {
											$hyoo_search_api.error(
												$hyoo_search_api.output().querySelector( '#recaptcha-wrapper' )
											)
										} )
									}
									return sce[ field ]( ... args )
								}
							}
							return sce[ field ]
						}
					} )
					
					done( google.search.cse.element )
					
				},
				
				searchCallbacks: {
					web: { ready: ready( 'web' ) },
					image: { ready: ready( 'image' ) },
				},
				
			}
			
			const uri = 'https://cse.google.com/cse.js?cx=002821183079327163555:WMX276788641&'
			await $mol_wire_async( this.$.$mol_import ).script( uri )
			
			return promise
			
		}
		
		@ $mol_mem
		static output() {
			return <div></div>
		}
		
		@ $mol_mem
		static error( next = null as null | Element ) {
			return next
		}
		
		@ $mol_memo.method
		async backend() {
			
			const backend = await $hyoo_search_api.backend()
			const gname = this.toString()
					
			backend.render({
				div: $hyoo_search_api.output(),
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
			$mol_wire_solid()
			const promise = $mol_promise< typeof Results.Value >()
			return { promise }
		}
		
		async execute_async( query: string ) {
			
			if( !query ) return []
			const backend = await this.backend()
			
			backend.execute( query )
 
			return this.future( query ).promise
		}
		
		@ $mol_mem_key
		async execute( query: string ) {
			
			$mol_wire_solid()
			
			const backend = await this.backend()
			
			if( !query ) return []
			
			backend.execute( query )
 
			return await this.future( query ).promise
		}
		
	}
	
}
