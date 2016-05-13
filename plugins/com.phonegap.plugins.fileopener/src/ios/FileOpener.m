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

    CDVPluginResult* pluginResult;
    NSString *path = [command.arguments objectAtIndex:0];
    
    // Calculate the UTI
    //NSArray *dotParts = [path componentsSeparatedByString:@"."];
   // NSString *fileExt = [dotParts lastObject];
    //NSString *uti = (__bridge NSString *)UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)fileExt, NULL);
    
    //NSLog(@"path %@, uti:%@", path, uti);
    
    NSArray *parts = [path componentsSeparatedByString:@"/"];
    NSString *previewDocumentFileName = [parts lastObject];
    NSLog(@"The file name is %@", previewDocumentFileName);
    
    /*NSData *fileRemote = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:path]];
    
    // Write file to the Documents directory
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    if (!documentsDirectory) {NSLog(@"Documents directory not found!");}
    localFile = [documentsDirectory stringByAppendingPathComponent:previewDocumentFileName];
    [fileRemote writeToFile:localFile atomically:YES];
    NSLog(@"Resource file '%@' has been written to the Documents directory from online", previewDocumentFileName);
    
    
    // Get file again from Documents directory
    NSURL *fileURL = [NSURL fileURLWithPath:localFile];*/
    NSURL *fileURL = [NSURL fileURLWithPath:path];
    
    // Initialize Document Interaction Controller
    // http://code.tutsplus.com/tutorials/ios-sdk-previewing-and-opening-documents--mobile-15130
    documentInteractionController = [UIDocumentInteractionController interactionControllerWithURL:fileURL];
    
    // Configure Document Interaction Controller
    [documentInteractionController setDelegate:self];
    
    // Configure the UTI type
    //[documentInteractionController setUTI:uti];
  
    
    CDVViewController* cont = (CDVViewController*)[ super viewController ];
//    CGSize viewSize = cont.view.bounds.size;
//    CGRect rect = CGRectMake(0, 0, viewSize.width, viewSize.height);
    CGRect rect = CGRectMake(0, 0, 1500.0f, 50.0f);
    BOOL wasOpened = [documentInteractionController presentOpenInMenuFromRect:rect inView:cont.view animated:YES];
    
    if(wasOpened) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: @""];
        NSLog(@"Success");
    }
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
