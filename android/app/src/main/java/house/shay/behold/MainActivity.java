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
 * stops its sound, as it does in a browser. When the page's renderer is gone, the page is built
 * again, as Android's guide to WebView termination has it (#151).
 */
public class MainActivity extends Activity {
    /** How many times in a run the page is built again at once before the app says it keeps stopping. */
    private static final int RESTARTS = 3;
    /** A web address no app claims, so Android answers it with the default browser (#151). */
    private static final Uri ANYWHERE = Uri.parse("https://example.com/");

    private WebView web;
    private Uri start;
    /** Back's callback from Android 13, registered only while the page has history to go back to. */
    private Object back;
    /** Whether the page failed to load, as with no connection: it loads again when the app returns. */
    private boolean failed;
    /** The launch, as the TWA's splash was: the icon's art at 300 dp over the page until it paints. */
    private View launch;
    /** The page's place between the bands, which a new page takes when the renderer is gone. */
    private FrameLayout page;
    /** Whether the player can see the app: from onResume to onPause. */
    private boolean resumed;
    /** Whether the renderer went while the app was hidden: the page is built again when it returns. */
    private boolean pending;
    /** The renderers that went while the player could see the game, this run or since Try again. */
    private int restarts;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        // The volume keys set the game's sound, as in a browser, even between sounds.
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        start = Uri.parse(getString(R.string.launchUrl));
        setContentView(layout());
        build();
        // After the renderer is gone, the bundle holds Android's own state but no page to restore.
        if (saved == null || web.restoreState(saved) == null) web.loadUrl(address(getIntent()));
    }

    /** The page: a WebView set up as the game needs it, under the launch's art until it paints. */
    @SuppressLint("SetJavaScriptEnabled")
    private void build() {
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
        failed = false;
        page.addView(web, 0);
        if (launch == null) {
            launch = new View(this);
            launch.setBackground(getDrawable(R.drawable.launch));
            page.addView(launch);
        }
    }

    /** The page again, at the address the app was opened with ([Q33]), after its renderer is gone. */
    private void restart() {
        build();
        web.loadUrl(address(getIntent()));
    }

    /** Past the cap: the game's words that it keeps stopping, and Try again, in the page's place. */
    private void stopped() {
        View stopped = getLayoutInflater().inflate(R.layout.stopped, page, false);
        stopped.findViewById(R.id.again)
                .setOnClickListener(
                        again -> {
                            page.removeView(stopped);
                            restarts = 0;
                            restart();
                        });
        page.addView(stopped);
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
        page = new FrameLayout(this);
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
     * A link that leaves the game, opened where Android opens it: a web address in the player's
     * default browser, even one on the game's own site, which this app would otherwise take back, and
     * Android asks only when no default is set; an email address in the phone's email app. A link to
     * anything else, or with no app to open it, does nothing.
     */
    private void open(Uri url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, url).addCategory(Intent.CATEGORY_BROWSABLE);
        if (onTheWeb(url)) {
            // Android finds the app by the selector and gives it the link (#151).
            intent.setSelector(
                    new Intent(Intent.ACTION_VIEW, ANYWHERE).addCategory(Intent.CATEGORY_BROWSABLE));
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

    /**
     * The page's text follows Android's font size, as WebView sets it by default ("AwSettings"); set
     * here too, so it still follows if that default changes.
     */
    private void zoomText(Configuration configuration) {
        if (web != null) web.getSettings().setTextZoom(Math.round(configuration.fontScale * 100));
    }

    /** Back is the page's while it has history, and Android's after that. */
    private void history() {
        if (Build.VERSION.SDK_INT < 33) return;
        OnBackInvokedDispatcher dispatcher = getOnBackInvokedDispatcher();
        boolean pageBack = web != null && web.canGoBack();
        if (pageBack && back == null) {
            OnBackInvokedCallback callback = web::goBack;
            dispatcher.registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, callback);
            back = callback;
        } else if (!pageBack && back != null) {
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
        Uri url = intent.getData();
        if (BuildConfig.DEBUG && url != null && "chrome".equals(url.getScheme())) {
            // The check build's way to make the renderer go (#151): chrome://crash or chrome://kill,
            // loaded after the intent's "wait", in seconds, so the app can be hidden first.
            page.postDelayed(
                    () -> {
                        if (web != null) web.loadUrl(url.toString());
                    },
                    intent.getIntExtra("wait", 0) * 1000L);
        } else if (web != null && url != null) {
            web.loadUrl(address(intent));
        }
    }

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        zoomText(configuration);
    }

    @Override
    protected void onPause() {
        super.onPause();
        resumed = false;
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        resumed = true;
        if (pending) {
            pending = false;
            restart();
        } else if (web != null) {
            web.onResume();
            if (failed) {
                failed = false;
                web.reload();
            }
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

        /**
         * The page's renderer is gone, killed for memory or crashed, and the page with it. While the
         * player can see the app, it's built again at once, up to RESTARTS times in a run; then the
         * app says the game keeps stopping. While the app is hidden, it's built when the player
         * returns, as Android's guide has it.
         */
        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            page.removeView(view);
            view.destroy();
            web = null;
            history();
            if (!resumed) pending = true;
            else if (++restarts > RESTARTS) stopped();
            else restart();
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
                            // Posted on the page's place: the tab is never on the screen, so a post
                            // on the tab itself would wait for it to be (#151).
                            page.post(from::destroy);
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

                        /** The tab shares the page's renderer, so it answers for itself when it goes (#151). */
                        @Override
                        public boolean onRenderProcessGone(WebView from, RenderProcessGoneDetail detail) {
                            from.destroy();
                            return true;
                        }
                    });
            ((WebView.WebViewTransport) result.obj).setWebView(tab);
            result.sendToTarget();
            return true;
        }
    }
}
