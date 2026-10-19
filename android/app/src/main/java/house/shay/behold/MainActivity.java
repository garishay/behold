package house.shay.behold;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Insets;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

/**
 * The Play app (Gate 17, #68): the game, loaded from its site, in a WebView that fills the screen
 * between Android's bars. The game's own pages open here; any other link, and any link the page
 * opens in a new tab, opens in the phone's browser. Back walks the page's history, then leaves the
 * app as Android leaves any app. The page is paused with the app, so it hears that it is hidden and
 * stops its sound, as it does in a browser.
 */
public class MainActivity extends Activity {
    private WebView web;
    private Uri start;
    /** Back's callback from Android 13, registered only while the page has history to go back to. */
    private Object back;
    /** Whether the page failed to load, as with no connection: it loads again when the app returns. */
    private boolean failed;
    /** The launch, as the TWA's splash was: the icon's art at 300 dp over the page until it paints. */
    private View launch;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        // The volume keys set the game's sound, as in a browser, even between sounds.
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        start = Uri.parse(getString(R.string.launchUrl));
        web = new WebView(this);
        web.setBackgroundColor(getColor(R.color.backgroundColor));
        WebSettings settings = web.getSettings();
        // JavaScript and the game's storage are off in a WebView until asked for ("WebSettings").
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        // A link the page opens in a new tab comes to onCreateWindow, not over the page.
        settings.setSupportMultipleWindows(true);
        // Pinch zoom, as the page allows it in a browser, without WebView's on-screen buttons.
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        zoomText(getResources().getConfiguration());
        web.setWebViewClient(new Pages());
        web.setWebChromeClient(new Tabs());
        setContentView(layout());
        // After the renderer is gone, the bundle holds Android's own state but no page to restore.
        if (saved == null || web.restoreState(saved) == null) web.loadUrl(address(getIntent()));
    }

    /**
     * The page between two bands coloured as Android's bars were in the TWA: the status bar the
     * manifest's theme colour, the navigation bar its background. Below Android 15 the theme colours
     * the bars and the bands stay empty; from 15 the app draws under them, and the bands take their
     * height. The launch lies over the page until the page paints.
     */
    private View layout() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        View top = new View(this);
        top.setBackgroundColor(getColor(R.color.themeColor));
        View bottom = new View(this);
        bottom.setBackgroundColor(getColor(R.color.navigationColor));
        FrameLayout page = new FrameLayout(this);
        page.addView(web);
        launch = new View(this);
        launch.setBackground(getDrawable(R.drawable.launch));
        page.addView(launch);
        root.addView(top, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0));
        root.addView(page, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));
        root.addView(bottom, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0));
        if (Build.VERSION.SDK_INT >= 35) {
            // No scrim over the bottom band under three-button navigation.
            getWindow().setNavigationBarContrastEnforced(false);
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                int types = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
                Insets bars = insets.getInsets(types);
                top.getLayoutParams().height = bars.top;
                bottom.getLayoutParams().height = bars.bottom;
                view.setPadding(bars.left, 0, bars.right, 0);
                top.requestLayout();
                bottom.requestLayout();
                // The page gets none of them, or WebView would give them to the game's
                // env(safe-area-inset-*), and the game would make room for the bars twice.
                return new WindowInsets.Builder(insets).setInsets(types, Insets.NONE).build();
            });
        }
        return root;
    }

    /** The page an intent asks for: a link to the site, or the game's start. */
    private String address(Intent intent) {
        Uri url = intent.getData();
        return url != null && ours(url) ? url.toString() : start.toString();
    }

    /** Whether an address is one of the game's own pages, on its site's origin. */
    private boolean ours(Uri url) {
        return "https".equals(url.getScheme())
                && start.getHost().equals(url.getHost())
                && url.getPort() == -1;
    }

    /**
     * A link that leaves the game, opened where Android opens it: a web address in the browser, even
     * one on the game's own site, which this app would otherwise take back; an email address in the
     * phone's email app. A link to anything else, or with no app to open it, does nothing.
     */
    private void open(Uri url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, url).addCategory(Intent.CATEGORY_BROWSABLE);
        if (onTheWeb(url)) {
            intent.setSelector(
                    Intent.makeMainSelectorActivity(Intent.ACTION_MAIN, Intent.CATEGORY_APP_BROWSER));
        } else if (!"mailto".equals(url.getScheme())) {
            return;
        }
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException none) {
            // No app takes the link: the tap does nothing.
        }
    }

    private static boolean onTheWeb(Uri url) {
        return "https".equals(url.getScheme()) || "http".equals(url.getScheme());
    }

    /** The page's text follows Android's font size, which WebView leaves at 100% ("WebSettings"). */
    private void zoomText(Configuration configuration) {
        if (web != null) web.getSettings().setTextZoom(Math.round(configuration.fontScale * 100));
    }

    /** Back is the page's while it has history, and Android's after that. */
    private void history() {
        if (Build.VERSION.SDK_INT < 33) return;
        OnBackInvokedDispatcher dispatcher = getOnBackInvokedDispatcher();
        if (web.canGoBack() && back == null) {
            OnBackInvokedCallback callback = web::goBack;
            dispatcher.registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, callback);
            back = callback;
        } else if (!web.canGoBack() && back != null) {
            dispatcher.unregisterOnBackInvokedCallback((OnBackInvokedCallback) back);
            back = null;
        }
    }

    /** Back on Android 12 and below, where the callback above doesn't exist. */
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (web != null && intent.getData() != null) web.loadUrl(address(intent));
    }

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        zoomText(configuration);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web == null) return;
        web.onResume();
        if (failed) {
            failed = false;
            web.reload();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    /** The game's pages stay here; every other address leaves for its own app. */
    private class Pages extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (ours(url)) return false;
            if (request.isForMainFrame()) open(url);
            return true;
        }

        @Override
        public void doUpdateVisitedHistory(WebView view, String url, boolean reload) {
            history();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) failed = true;
        }

        /** The page has painted: the launch fades out over 300 ms, as the TWA's splash did. */
        @Override
        public void onPageCommitVisible(WebView view, String url) {
            if (launch == null) return;
            View art = launch;
            launch = null;
            art.animate()
                    .alpha(0)
                    .setDuration(300)
                    .withEndAction(() -> ((ViewGroup) art.getParent()).removeView(art));
        }

        /** The page's renderer is gone, killed for memory or crashed: start the app again. */
        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            ((ViewGroup) view.getParent()).removeView(view);
            view.destroy();
            web = null;
            recreate();
            return true;
        }
    }

    /**
     * A link the page opens in a new tab: the reveal's "(NIV)" and its API.Bible, the credit's
     * licence. The new tab is never shown: its first address goes to the browser, so the game stays
     * where it was, as it did when Chrome opened the tab.
     */
    private class Tabs extends WebChromeClient {
        @Override
        public boolean onCreateWindow(WebView view, boolean dialog, boolean gesture, Message result) {
            if (!gesture) return false;
            WebView tab = new WebView(view.getContext());
            tab.setWebViewClient(
                    new WebViewClient() {
                        private boolean sent;

                        /** The tab's first web or email address, sent once; a blank start waits. */
                        private boolean send(WebView from, Uri url) {
                            if (sent || !(onTheWeb(url) || "mailto".equals(url.getScheme()))) return false;
                            sent = true;
                            open(url);
                            from.post(from::destroy);
                            return true;
                        }

                        @Override
                        public boolean shouldOverrideUrlLoading(WebView from, WebResourceRequest request) {
                            send(from, request.getUrl());
                            return true;
                        }

                        @Override
                        public void onPageStarted(WebView from, String url, Bitmap icon) {
                            if (send(from, Uri.parse(url))) from.stopLoading();
                        }
                    });
            ((WebView.WebViewTransport) result.obj).setWebView(tab);
            result.sendToTarget();
            return true;
        }
    }
}
