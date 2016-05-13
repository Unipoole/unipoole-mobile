//
//  FileOpener.m
//  FileOpener
//
//  Taken from OpenWith, originally created by Andrew Trice on 8/15/12.
//
//  THIS SOFTWARE IS PROVIDED BY ANDREW TRICE "AS IS" AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
//  EVENT SHALL ANDREW TRICE OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
//  ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

#import "FileOpener.h"
#import <MobileCoreServices/MobileCoreServices.h>
/**
 * Also thanks to 
 * https://github.com/jwark/FileOpener/blob/cordova-3.0/src/ios/
 * http://code.tutsplus.com/tutorials/ios-sdk-previewing-and-opening-documents--mobile-15130
 */
@implementation FileOpener

@synthesize controller = documentInteractionController;

- (void) openFile: (CDVInvokedUrlCommand*)command
{
    // Result for this plugin execution
    CDVPluginResult* pluginResult;
    
    // Path we need to open
    NSString *path = [command.arguments objectAtIndex:0];
    
    // Flag if opening the path was a success
    BOOL success = FALSE;
    
    // If the url is a weblink, we will rather open it in a web browser
    if([path hasPrefix:@"http://"] || [path hasPrefix:@"https://"]){
        UIApplication *webBrowser = [UIApplication sharedApplication];
        NSURL *myURL = [[NSURL alloc]initWithString:path];
        success = [webBrowser openURL:myURL];
    }
    // If it is not a web link, we will have to create a fileopener prompt
    else {
        // UTI to use for the url, this might be null
        NSString *uti = NULL;
        
        // If there is a mimetype, use it to get a UTI
        if ([command.arguments count] >= 2) {
            CFStringRef MIMEType = (__bridge CFStringRef)[command.arguments objectAtIndex:1];
            CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassMIMEType, MIMEType, NULL);
            uti = (__bridge_transfer NSString *)UTI;
        }
        // If there is no mimetype, we can figure one out from the file extention
        else {
            // Calculate the UTI
            // NSArray *dotParts = [path componentsSeparatedByString:@"."];
            // NSString *fileExt = [dotParts lastObject];
            // NSString *uti = (__bridge NSString *)UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)fileExt, NULL);

        }
        
        NSURL *fileURL = [NSURL fileURLWithPath:path];
        
        // Initialize Document Interaction Controller
        // http://code.tutsplus.com/tutorials/ios-sdk-previewing-and-opening-documents--mobile-15130
        documentInteractionController = [UIDocumentInteractionController interactionControllerWithURL:fileURL];
        
        // Configure Document Interaction Controller
        [documentInteractionController setDelegate:self];
        
        // Configure the UTI type
        if (uti != NULL) {
            [documentInteractionController setUTI:uti];
        }
        
        CDVViewController* cont = (CDVViewController*)[ super viewController ];
        //    CGSize viewSize = cont.view.bounds.size;
        //    CGRect rect = CGRectMake(0, 0, viewSize.width, viewSize.height);
        CGRect rect = CGRectMake(0, 0, 1500.0f, 50.0f);
        success = [documentInteractionController presentOpenInMenuFromRect:rect inView:cont.view animated:YES];
    }
    
    // If it was a successfull execution we update the plugin result accordingly
    if(success) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: @""];
        NSLog(@"Success");
    }
    // If we failed to open the file we send that as a result
    else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No application found to open file."];
        NSLog(@"Could not handle UTI");
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
   
}

- (void) documentInteractionControllerDidDismissOptionsMenu:(UIDocumentInteractionController *)controller {
}

- (void) documentInteractionController: (UIDocumentInteractionController *) controller didEndSendingToApplication: (NSString *) application {
    // Nothing here
}

@end
