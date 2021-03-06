#ifndef __HAVE_PARSOID_H__
#define __HAVE_PARSOID_H__

// Create minimal external header with interface types
#include "parsoid_internal.hpp"

namespace parsoid {

/**
 * The main Parsoid setup class
 */
class Parsoid {
    public:
        Parsoid();
        void parse( string input, DOM::DocumentReceiver receiver );
        // Overloaded sync version
        DOM::XMLDocumentPtr parse( string input );

        void setReceiver( DOM::DocumentReceiver receiver ) {
            this->receiver = receiver;
        }
    private:
        /**
         * The top-level scope. Lower-level scopes will be owned by the
         * TemplateTransformer and AttributeExpansionTransfomer, which are in
         * turn owned by their pipeline via the AsyncTokenTransformManager.
         */
        Scope scope;

        /**
         * The main input / expansion pipeline
         */
        InputExpansionPipeline mainInputExpansionPipeline;

        /**
         * The output pipeline, created by the constructor
         */
        OutputPipeline syncOutputPipeline;

        // The document receiver
        DOM::DocumentReceiver receiver;

};


} // namespace parsoid

#endif
